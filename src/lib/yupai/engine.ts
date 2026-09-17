import { newId } from "./ids.ts";
import { pickPairs, pairKey, pickOpponentForCore, type Candidate } from "./matching.ts";
import { applyMatchRating, ratingSummary } from "./rating.ts";
import type {
  BoardAction,
  BoardState,
  ActionResult,
  EngineError,
  Match,
  Player,
  PlayerStatus,
  Restriction,
  Session,
  DropDest,
} from "./types.ts";
import { clampSkill, SKILL_DEFAULT } from "./types.ts";

function cloneState(state: BoardState): BoardState {
  return structuredClone(state);
}

function iso(now: number): string {
  return new Date(now).toISOString();
}

function player(state: BoardState, id: string): Player {
  const p = state.players.find((x) => x.id === id);
  if (!p) throw new Error("找不到這位球員");
  return p;
}

function liveMatchOnCourt(state: BoardState, courtNo: number): Match | undefined {
  return state.matches.find((m) => m.status === "live" && m.courtNo === courtNo);
}

function occupants(
  state: BoardState,
  courtNo: number,
  status: PlayerStatus,
): Player[] {
  return state.players.filter((p) => p.status === status && p.courtNo === courtNo);
}

function closeWait(p: Player, now: number) {
  if (p.lastWaitStart) {
    p.waitTotalSec += Math.max(0, Math.round((now - Date.parse(p.lastWaitStart)) / 1000));
    p.lastWaitStart = null;
  }
}

function startWait(p: Player, now: number) {
  if (!p.lastWaitStart) p.lastWaitStart = iso(now);
}

function waitMs(p: Player, now: number): number {
  if (!p.lastWaitStart) return p.waitTotalSec * 1000;
  return p.waitTotalSec * 1000 + Math.max(0, now - Date.parse(p.lastWaitStart));
}

function nicknameTaken(state: BoardState, nickname: string, exceptId?: string) {
  const n = nickname.trim();
  return state.players.some(
    (p) => p.nickname === n && p.id !== exceptId,
  );
}

function meetingsMap(state: BoardState): Map<string, number> {
  const map = new Map<string, number>();
  for (const m of state.matches) {
    if (m.status !== "completed") continue;
    const k = pairKey(m.playerAId, m.playerBId);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map;
}

function lastOpponentsMap(state: BoardState): Map<string, string[]> {
  const map = new Map<string, string[]>();
  const done = state.matches
    .filter((m) => m.status === "completed" && m.endedAt)
    .sort((a, b) => (a.endedAt ?? "").localeCompare(b.endedAt ?? ""));
  for (const m of done) {
    const push = (id: string, opp: string) => {
      const arr = map.get(id) ?? [];
      arr.push(opp);
      map.set(id, arr.slice(-2));
    };
    push(m.playerAId, m.playerBId);
    push(m.playerBId, m.playerAId);
  }
  return map;
}

function candidates(state: BoardState, now: number): Candidate[] {
  return state.players
    .filter(
      (p) =>
        (p.status === "rest") &&
        !p.locked,
    )
    .map((p) => ({
      id: p.id,
      waitMs: waitMs(p, now),
      playCount: p.playCount,
      skill: p.skill,
    }));
}

function preferredOpen(state: BoardState) {
  return state.restrictions
    .filter((r) => r.kind === "preferred" && !r.used)
    .map((r) => ({ id: r.id, a: r.playerAId, b: r.playerBId }));
}

function blacklistSet(state: BoardState) {
  const set = new Set<string>();
  for (const r of state.restrictions) {
    if (r.kind === "blacklist") set.add(pairKey(r.playerAId, r.playerBId));
  }
  return set;
}

function pairingInput(state: BoardState, slotCount: number, now: number) {
  return {
    candidates: candidates(state, now),
    slotCount,
    meetings: meetingsMap(state),
    lastOpponents: lastOpponentsMap(state),
    blacklist: blacklistSet(state),
    preferred: preferredOpen(state),
    weights: state.session.weights,
    banRecent: state.session.banRecentOpponent,
  };
}

function cancelLive(state: BoardState, courtNo: number, now: number) {
  const match = liveMatchOnCourt(state, courtNo);
  if (!match) return;
  match.status = "cancelled";
  match.endedAt = iso(now);
}

function startMatch(
  state: BoardState,
  courtNo: number,
  aId: string,
  bId: string,
  source: "auto" | "manual",
  now: number,
) {
  cancelLive(state, courtNo, now);
  const a = player(state, aId);
  const b = player(state, bId);
  closeWait(a, now);
  closeWait(b, now);
  a.status = "on_court";
  b.status = "on_court";
  a.courtNo = courtNo;
  b.courtNo = courtNo;
  a.locked = false;
  b.locked = false;
  state.matches.push({
    id: newId(),
    courtNo,
    playerAId: aId,
    playerBId: bId,
    startedAt: iso(now),
    endedAt: null,
    source,
    status: "live",
    winnerId: null,
    scoreA: null,
    scoreB: null,
    durationMin: state.session.matchDurationMin,
    extendedSec: 0,
    pauseAccumulatedMs: 0,
    pausedAt: null,
  });
}

function assignQueue(
  state: BoardState,
  courtNo: number,
  aId: string,
  bId: string,
) {
  const a = player(state, aId);
  const b = player(state, bId);
  a.status = "queued";
  b.status = "queued";
  a.courtNo = courtNo;
  b.courtNo = courtNo;
}

function sendToRest(p: Player, now: number) {
  p.status = "rest";
  p.courtNo = null;
  startWait(p, now);
}

function markUsedPreferred(state: BoardState, ids: string[]) {
  for (const id of ids) {
    const r = state.restrictions.find((x) => x.id === id);
    if (r) r.used = true;
  }
}

function convertForceRest(state: BoardState, now: number) {
  for (const p of state.players) {
    if (p.status !== "force_rest") continue;
    p.status = "rest";
    p.consecutivePlayed = 0;
    startWait(p, now);
  }
}

function applyBye(state: BoardState, byeId: string | null) {
  if (!byeId) return;
  const p = state.players.find((x) => x.id === byeId);
  if (p) p.byeCount += 1;
}

function emptyCourts(state: BoardState, onlyCourtNo?: number): number[] {
  const out: number[] = [];
  const from = onlyCourtNo ?? 1;
  const to = onlyCourtNo ?? state.session.courtCount;
  for (let n = from; n <= to; n++) {
    if (occupants(state, n, "on_court").length === 0) out.push(n);
  }
  return out;
}

function emptyQueueSlots(state: BoardState, onlyCourtNo?: number): number[] {
  const out: number[] = [];
  const from = onlyCourtNo ?? 1;
  const to = onlyCourtNo ?? state.session.courtCount;
  for (let n = from; n <= to; n++) {
    if (occupants(state, n, "queued").length === 0) out.push(n);
  }
  return out;
}

function queueHasVacancy(state: BoardState): boolean {
  for (let n = 1; n <= state.session.courtCount; n++) {
    if (occupants(state, n, "queued").length < 2) return true;
  }
  return false;
}

function fillOneSeatCourts(state: BoardState, now: number): { count: number; warning?: string } {
  let count = 0;
  const warnings: string[] = [];
  for (let n = 1; n <= state.session.courtCount; n++) {
    const on = occupants(state, n, "on_court");
    if (on.length !== 1) continue;
    const core = on[0]!;
    const oppId = pickOpponentForCore(core.id, {
      candidates: [
        {
          id: core.id,
          waitMs: waitMs(core, now),
          playCount: core.playCount,
          skill: core.skill,
        },
        ...candidates(state, now),
      ],
      meetings: meetingsMap(state),
      lastOpponents: lastOpponentsMap(state),
      blacklist: blacklistSet(state),
      weights: state.session.weights,
      banRecent: state.session.banRecentOpponent,
      preferred: preferredOpen(state),
    });
    if (!oppId) {
      warnings.push(`第 ${n} 場還差 1 人`);
      continue;
    }
    startMatch(state, n, core.id, oppId, "auto", now);
    count += 1;
  }
  return { count, warning: warnings[0] };
}

function firstCompleteQueueSlot(state: BoardState): number | null {
  for (let n = 1; n <= state.session.courtCount; n++) {
    if (occupants(state, n, "queued").length === 2) return n;
  }
  return null;
}

function compactQueue(state: BoardState) {
  const occupied: number[] = [];
  for (let n = 1; n <= state.session.courtCount; n++) {
    if (occupants(state, n, "queued").length > 0) occupied.push(n);
  }
  let dest = 1;
  for (const src of occupied) {
    if (src !== dest) {
      for (const p of occupants(state, src, "queued")) p.courtNo = dest;
    }
    dest += 1;
  }
}

function takeQueuePairOntoCourt(state: BoardState, courtNo: number, now: number): boolean {
  const slot = firstCompleteQueueSlot(state);
  if (slot == null) return false;
  const queued = occupants(state, slot, "queued");
  startMatch(state, courtNo, queued[0]!.id, queued[1]!.id, "auto", now);
  compactQueue(state);
  return true;
}

function promoteQueuedToEmptyCourts(state: BoardState, now: number): number {
  let n = 0;
  for (let no = 1; no <= state.session.courtCount; no++) {
    if (occupants(state, no, "on_court").length !== 0) continue;
    if (!takeQueuePairOntoCourt(state, no, now)) break;
    n += 1;
  }
  return n;
}

function restrictionWarn(raw: string | null): string | undefined {
  if (!raw) return undefined;
  if (raw === "人數不足" || raw === "可排的人不足以填滿所有空場") return undefined;
  return raw;
}

function pairRestInto(
  state: BoardState,
  now: number,
  includeQueues: boolean,
  includeCourts: boolean,
  onlyCourtNo?: number,
): { count: number; warning?: string; fail?: string } {
  const courts = includeCourts ? emptyCourts(state, onlyCourtNo) : [];
  const queues = includeQueues ? emptyQueueSlots(state, onlyCourtNo) : [];
  const slots = [
    ...queues.map((no) => ({ kind: "queue" as const, no })),
    ...courts.map((no) => ({ kind: "court" as const, no })),
  ];
  const maxPairs = Math.floor(candidates(state, now).length / 2);
  if (slots.length === 0 || maxPairs === 0) return { count: 0 };
  const want = Math.min(slots.length, maxPairs);
  const result = pickPairs(pairingInput(state, want, now));
  if (result.failReason || result.pairs.length === 0) {
    return { count: 0, fail: result.failReason ?? "排不出組合" };
  }
  for (let i = 0; i < result.pairs.length; i++) {
    const pair = result.pairs[i]!;
    const slot = slots[i]!;
    if (slot.kind === "court") {
      startMatch(state, slot.no, pair.a, pair.b, "auto", now);
    } else {
      assignQueue(state, slot.no, pair.a, pair.b);
    }
  }
  markUsedPreferred(state, result.usedPreferredIds);
  applyBye(state, result.byeId);
  return { count: result.pairs.length, warning: restrictionWarn(result.warning) };
}

function hasHungryCourt(state: BoardState): boolean {
  for (let n = 1; n <= state.session.courtCount; n++) {
    const on = occupants(state, n, "on_court").length;
    if (on === 0 || on === 1) return true;
  }
  return false;
}

function explainFillFail(state: BoardState, fallback: string): string {
  const restReady = state.players.filter((p) => p.status === "rest" && !p.locked);
  const notArrived = state.players.filter((p) => p.status === "not_arrived");
  const force = state.players.filter((p) => p.status === "force_rest");
  const locked = state.players.filter((p) => p.locked && p.status === "rest");
  const queued = state.players.filter((p) => p.status === "queued");
  const onCourt = state.players.filter((p) => p.status === "on_court");
  if (state.players.length === 0) {
    return "還沒有球員。請先打開名單加入，加入後會進休息區。";
  }
  if (restReady.length < 2 && notArrived.length > 0) {
    return `休息區可排 ${restReady.length} 人。還有 ${notArrived.length} 人未簽到，請在名單按「全部簽到」。`;
  }
  if (restReady.length < 2 && force.length > 0) {
    return "剛下場的人還在強制休息。再按一次「排下一場」就會輪到他們。";
  }
  if (restReady.length < 2 && locked.length > 0) {
    return `休息區可排 ${restReady.length} 人（有人鎖定不排）。至少要 2 人才排得了單打。`;
  }
  if (restReady.length < 2 && queued.length >= 2 && hasHungryCourt(state)) {
    return "空場會依上場順位補人。再按一次「排下一場」就會從順位 1 開始上場。";
  }
  if (restReady.length < 2 && onCourt.length >= 2) {
    return `休息區沒人可排下一場。人還在場上打，下場後再排。`;
  }
  if (restReady.length < 2) {
    return `休息區可排 ${restReady.length} 人，單打至少要 2 人。`;
  }
  return fallback;
}

function fillMessage(up: number, queuedPairs: number, queuedPeople = 0): string | undefined {
  const bits: string[] = [];
  if (up > 0) bits.push(`上場 ${up} 組`);
  if (queuedPairs > 0) bits.push(`下一場排出 ${queuedPairs} 組`);
  if (queuedPeople > 0) bits.push(`下一場排出 ${queuedPeople} 人`);
  return bits.length ? bits.join("，") : undefined;
}

function opponentPool(state: BoardState, core: Player, extra: Candidate[], now: number) {
  return {
    candidates: [
      {
        id: core.id,
        waitMs: waitMs(core, now),
        playCount: core.playCount,
        skill: core.skill,
      },
      ...extra,
    ],
    meetings: meetingsMap(state),
    lastOpponents: lastOpponentsMap(state),
    blacklist: blacklistSet(state),
    preferred: preferredOpen(state),
    weights: state.session.weights,
    banRecent: state.session.banRecentOpponent,
  };
}

function completePartialQueue(state: BoardState, courtNo: number, now: number): boolean {
  const queued = occupants(state, courtNo, "queued");
  if (queued.length !== 1) return false;
  const core = queued[0]!;
  const oppId = pickOpponentForCore(
    core.id,
    opponentPool(state, core, candidates(state, now), now),
  );
  if (!oppId) return false;
  assignQueue(state, courtNo, core.id, oppId);
  return true;
}

function completeAllPartialQueues(state: BoardState, now: number): number {
  let n = 0;
  for (let no = 1; no <= state.session.courtCount; no++) {
    if (completePartialQueue(state, no, now)) n += 1;
  }
  return n;
}

function liveOnCourt(state: BoardState, courtNo: number) {
  return occupants(state, courtNo, "on_court").length;
}

function refillAfterMatch(
  state: BoardState,
  courtNo: number,
  now: number,
): { up: number; queued: number; people: number; warning?: string } {
  let people = completeAllPartialQueues(state, now);
  const promoWarn = promoteCourt(state, courtNo, now);
  let up = liveOnCourt(state, courtNo) === 2 ? 1 : 0;
  let fail: string | undefined;

  if (liveOnCourt(state, courtNo) === 0) {
    const staged = pairRestInto(state, now, true, false);
    people += completeAllPartialQueues(state, now);
    promoteCourt(state, courtNo, now);
    if (liveOnCourt(state, courtNo) === 2) up = 1;
    else fail = staged.fail;
  }

  const next = pairRestInto(state, now, true, false);

  let warning: string | undefined;
  if (promoWarn) warning = promoWarn;
  else if (up === 0 && fail && fail !== "人數不足") warning = fail;
  else if (up === 0 && candidates(state, now).length >= 2) {
    warning = explainFillFail(state, fail ?? "休息區沒人可補上場");
  }
  convertForceRest(state, now);
  return { up, queued: next.count, people, warning };
}

function fillNext(state: BoardState, now: number): { warning?: string; message?: string } {
  // 休息區只進上場順位。已在順位裡的成組才補空場，且從順位 1 開始。
  const people = completeAllPartialQueues(state, now);
  const promoted = promoteQueuedToEmptyCourts(state, now);
  const seat = fillOneSeatCourts(state, now);

  if (promoted + seat.count + people === 0 && !queueHasVacancy(state)) {
    convertForceRest(state, now);
    return { message: "下一場都排滿了", warning: seat.warning };
  }

  let queued = pairRestInto(state, now, true, false);

  if (queued.count === 0 && Math.floor(candidates(state, now).length / 2) === 0) {
    const forceN = state.players.filter((p) => p.status === "force_rest").length;
    if (forceN > 0) {
      convertForceRest(state, now);
      queued = pairRestInto(state, now, true, false);
    }
  }

  const up = promoted + seat.count;
  if (up + queued.count + people === 0) {
    const why = explainFillFail(state, queued.fail ?? "休息區可排的人不足，單打至少要 2 人。");
    convertForceRest(state, now);
    return { warning: why };
  }
  convertForceRest(state, now);
  return {
    message: fillMessage(up, queued.count, people),
    warning: queued.warning ?? seat.warning,
  };
}

function releaseFromCourt(state: BoardState, p: Player, now: number) {
  const courtNo = p.courtNo;
  if (courtNo != null) cancelLive(state, courtNo, now);
  sendToRest(p, now);
}

function releaseFromQueue(state: BoardState, p: Player, now: number) {
  sendToRest(p, now);
}

function detach(state: BoardState, ids: string[], now: number) {
  for (const id of ids) {
    const p = player(state, id);
    if (p.status === "on_court") releaseFromCourt(state, p, now);
    else if (p.status === "queued") releaseFromQueue(state, p, now);
    else if (p.status === "left" || p.status === "not_arrived") {
      p.status = "rest";
      p.courtNo = null;
      startWait(p, now);
    } else {
      p.courtNo = null;
      if (p.status === "force_rest") {
        /* keep */
      } else {
        p.status = "rest";
      }
      startWait(p, now);
    }
  }
}

function moveToRest(state: BoardState, ids: string[], now: number) {
  detach(state, ids, now);
  for (const id of ids) sendToRest(player(state, id), now);
}

function moveToCourt(
  state: BoardState,
  ids: string[],
  courtNo: number,
  replacePlayerId: string | undefined,
  now: number,
) {
  if (courtNo < 1 || courtNo > state.session.courtCount) {
    throw new Error("場號不存在");
  }
  const on = occupants(state, courtNo, "on_court");
  const incoming = ids.map((id) => player(state, id));

  if (incoming.length === 2 && on.length === 2) {
    for (const p of on) sendToRest(p, now);
    cancelLive(state, courtNo, now);
    detach(state, ids, now);
    startMatch(state, courtNo, incoming[0]!.id, incoming[1]!.id, "manual", now);
    return;
  }

  if (incoming.length === 2 && on.length === 0) {
    detach(state, ids, now);
    startMatch(state, courtNo, incoming[0]!.id, incoming[1]!.id, "manual", now);
    return;
  }

  if (incoming.length === 2 && on.length === 1) {
    throw new Error("場上已有 1 人，請先拖單人補位或清場");
  }

  const one = incoming[0]!;
  if (on.length >= 2) {
    if (!replacePlayerId) throw new Error("場上已有 2 人，請先指定要換下的人");
    const out = on.find((p) => p.id === replacePlayerId);
    if (!out) throw new Error("找不到要換下的人");
    detach(state, [one.id], now);
    sendToRest(out, now);
    cancelLive(state, courtNo, now);
    const stay = on.find((p) => p.id !== replacePlayerId)!;
    startMatch(state, courtNo, stay.id, one.id, "manual", now);
    return;
  }

  if (on.length === 1) {
    const stay = on[0]!;
    if (stay.id === one.id) return;
    detach(state, [one.id], now);
    startMatch(state, courtNo, stay.id, one.id, "manual", now);
    return;
  }

  detach(state, [one.id], now);
  one.status = "on_court";
  one.courtNo = courtNo;
  closeWait(one, now);
}

function moveToQueue(
  state: BoardState,
  ids: string[],
  courtNo: number,
  replacePlayerId: string | undefined,
  now: number,
) {
  if (courtNo < 1 || courtNo > state.session.courtCount) {
    throw new Error("場號不存在");
  }
  const queued = occupants(state, courtNo, "queued");
  const incoming = ids.map((id) => player(state, id));

  if (incoming.length === 2) {
    for (const p of queued) sendToRest(p, now);
    detach(state, ids, now);
    assignQueue(state, courtNo, incoming[0]!.id, incoming[1]!.id);
    return;
  }

  const one = incoming[0]!;
  if (queued.length >= 2) {
    if (!replacePlayerId) throw new Error("下一場已有 2 人，請先指定要換下的人");
    const out = queued.find((p) => p.id === replacePlayerId);
    if (!out) throw new Error("找不到要換下的人");
    detach(state, [one.id], now);
    sendToRest(out, now);
    const stay = queued.find((p) => p.id !== replacePlayerId)!;
    assignQueue(state, courtNo, stay.id, one.id);
    return;
  }

  if (queued.length === 1) {
    const stay = queued[0]!;
    if (stay.id === one.id) return;
    detach(state, [one.id], now);
    assignQueue(state, courtNo, stay.id, one.id);
    return;
  }

  detach(state, [one.id], now);
  one.status = "queued";
  one.courtNo = courtNo;
}

function applyMove(
  state: BoardState,
  playerIds: string[],
  dest: DropDest,
  now: number,
) {
  const ids = [...new Set(playerIds)];
  if (ids.length === 0) throw new Error("沒有要移動的人");
  if (dest.zone === "rest") {
    moveToRest(state, ids, now);
  } else if (dest.zone === "court") {
    moveToCourt(state, ids, dest.courtNo, dest.replacePlayerId, now);
  } else {
    moveToQueue(state, ids, dest.courtNo, dest.replacePlayerId, now);
    return;
  }
  promoteQueuedToEmptyCourts(state, now);
}

function promoteCourt(state: BoardState, courtNo: number, now: number): string | undefined {
  if (occupants(state, courtNo, "on_court").length !== 0) return;
  if (takeQueuePairOntoCourt(state, courtNo, now)) return;
  for (let n = 1; n <= state.session.courtCount; n++) {
    if (occupants(state, n, "queued").length === 1) {
      return "上場順位還差 1 人，無法開打";
    }
  }
  return;
}

function finishMatch(
  state: BoardState,
  courtNo: number,
  now: number,
  winnerId?: string | null,
  scoreA?: number | null,
  scoreB?: number | null,
) {
  const match = liveMatchOnCourt(state, courtNo);
  if (!match) throw new Error("這面場沒有進行中的單打");
  const a = player(state, match.playerAId);
  const b = player(state, match.playerBId);
  const started = match.startedAt ? Date.parse(match.startedAt) : now;
  const pausedNow = match.pausedAt ? now - Date.parse(match.pausedAt) : 0;
  const elapsed = Math.max(
    0,
    Math.round((now - started - match.pauseAccumulatedMs - pausedNow) / 1000),
  );
  match.status = "completed";
  match.endedAt = iso(now);
  match.pausedAt = null;
  if (scoreA != null) match.scoreA = scoreA;
  if (scoreB != null) match.scoreB = scoreB;
  let win = winnerId ?? null;
  if (!win && match.scoreA != null && match.scoreB != null) {
    if (match.scoreA > match.scoreB) win = a.id;
    else if (match.scoreB > match.scoreA) win = b.id;
  }
  if (win) match.winnerId = win;

  const update = applyMatchRating({
    skillA: a.skill,
    skillB: b.skill,
    scoreA: match.scoreA,
    scoreB: match.scoreB,
    winner: win === a.id ? "a" : win === b.id ? "b" : null,
  });
  let ratingNote: string | undefined;
  if (update) {
    a.skill = update.skillA;
    b.skill = update.skillB;
    ratingNote = ratingSummary(a.nickname, b.nickname, update);
  }

  const finishPlayer = (p: Player, oppId: string) => {
    p.playCount += 1;
    p.playTotalSec += elapsed;
    p.consecutivePlayed += 1;
    p.lastOpponentId = oppId;
    p.courtNo = null;
    const mustRest =
      state.session.forceRestAfterMatch ||
      p.consecutivePlayed >= state.session.consecutiveLimit;
    p.status = mustRest ? "force_rest" : "rest";
    startWait(p, now);
  };
  finishPlayer(a, b.id);
  finishPlayer(b, a.id);
  const refill = refillAfterMatch(state, courtNo, now);
  return { ...refill, ratingNote };
}

function addPlayer(
  state: BoardState,
  nickname: string,
  skill: number,
  isDropIn: boolean,
  now: number,
) {
  const name = nickname.trim();
  if (!name) throw new Error("請輸入暱稱");
  if (nicknameTaken(state, name)) throw new Error("同一場次暱稱不可重複");
  const sk = clampSkill(skill || SKILL_DEFAULT);
  state.players.push({
    id: newId(),
    nickname: name,
    skill: sk,
    seedSkill: sk,
    isDropIn,
    status: "rest",
    locked: false,
    courtNo: null,
    consecutivePlayed: 0,
    playCount: 0,
    byeCount: 0,
    waitTotalSec: 0,
    playTotalSec: 0,
    lastWaitStart: null,
    lastOpponentId: null,
    sortOrder: state.players.length,
  });
  startWait(state.players[state.players.length - 1]!, now);
}

function setStatus(state: BoardState, playerId: string, status: PlayerStatus, now: number) {
  const p = player(state, playerId);
  if (p.status === "on_court" && status !== "on_court") {
    releaseFromCourt(state, p, now);
  }
  if (p.status === "queued" && status !== "queued") {
    releaseFromQueue(state, p, now);
  }
  p.status = status;
  if (status === "left" || status === "not_arrived") {
    p.courtNo = null;
    p.locked = false;
    p.lastWaitStart = null;
  } else if (status === "rest" || status === "force_rest") {
    p.courtNo = null;
    startWait(p, now);
  }
}

function assertWritable(state: BoardState) {
  if (state.session.status === "ended") throw new Error("場次已結束，目前只讀");
}

export function applyAction(
  state: BoardState,
  action: BoardAction,
  now = Date.now(),
): ActionResult | EngineError {
  try {
    const next = cloneState(state);
    if (action.type !== "reopenSession") assertWritable(next);

    switch (action.type) {
      case "addPlayer": {
        addPlayer(next, action.nickname, action.skill, action.isDropIn ?? false, now);
        return { state: next, message: `已加入 ${action.nickname.trim()}` };
      }
      case "renamePlayer": {
        const name = action.nickname.trim();
        if (!name) throw new Error("請輸入暱稱");
        if (nicknameTaken(next, name, action.playerId)) {
          throw new Error("同一場次暱稱不可重複");
        }
        player(next, action.playerId).nickname = name;
        return { state: next };
      }
      case "removePlayer": {
        const p = player(next, action.playerId);
        if (p.status === "on_court") releaseFromCourt(next, p, now);
        if (p.status === "queued") releaseFromQueue(next, p, now);
        next.players = next.players.filter((x) => x.id !== p.id);
        next.restrictions = next.restrictions.filter(
          (r) => r.playerAId !== p.id && r.playerBId !== p.id,
        );
        return { state: next, message: `已刪除 ${p.nickname}` };
      }
      case "setStatus": {
        setStatus(next, action.playerId, action.status, now);
        return { state: next };
      }
      case "setLocked": {
        player(next, action.playerId).locked = action.locked;
        return { state: next };
      }
      case "setSkill": {
        const sk = clampSkill(action.skill);
        const p = player(next, action.playerId);
        p.skill = sk;
        p.seedSkill = sk;
        return { state: next };
      }
      case "importPlayers": {
        let added = 0;
        for (const row of action.rows) {
          if (!row.nickname.trim()) continue;
          if (nicknameTaken(next, row.nickname.trim())) continue;
          addPlayer(next, row.nickname, row.skill, row.isDropIn, now);
          added += 1;
        }
        return { state: next, message: `匯入 ${added} 人` };
      }
      case "checkInAll": {
        let n = 0;
        for (const p of next.players) {
          if (p.status !== "not_arrived") continue;
          p.status = "rest";
          startWait(p, now);
          n += 1;
        }
        return { state: next, message: n ? `已簽到 ${n} 人` : "沒有未到球員" };
      }
      case "addRestriction": {
        if (action.playerAId === action.playerBId) {
          throw new Error("請選兩位不同的球員");
        }
        player(next, action.playerAId);
        player(next, action.playerBId);
        next.restrictions.push({
          id: newId(),
          kind: action.kind,
          playerAId: action.playerAId,
          playerBId: action.playerBId,
          used: false,
        });
        return {
          state: next,
          message: action.kind === "preferred" ? "已指定對戰" : "已加入黑名單",
        };
      }
      case "removeRestriction": {
        next.restrictions = next.restrictions.filter((r) => r.id !== action.id);
        return { state: next };
      }
      case "fillNext": {
        const out = fillNext(next, now);
        return { state: next, ...out };
      }
      case "reshuffleNext": {
        for (const p of next.players) {
          if (p.status === "queued") sendToRest(p, now);
        }
        const out = fillNext(next, now);
        return { state: next, message: out.message ?? "已重排下一場", warning: out.warning };
      }
      case "endMatch": {
        const out = finishMatch(
          next,
          action.courtNo,
          now,
          action.winnerId,
          action.scoreA,
          action.scoreB,
        );
        const fill = fillMessage(out.up, out.queued, out.people);
        const head = out.ratingNote
          ? `第 ${action.courtNo} 場下場 · ${out.ratingNote}`
          : `第 ${action.courtNo} 場下場`;
        return {
          state: next,
          message: fill ? `${head} · ${fill}` : head,
          warning: out.warning,
        };
      }
      case "pauseMatch": {
        const m = liveMatchOnCourt(next, action.courtNo);
        if (!m) throw new Error("這面場沒有進行中的單打");
        if (m.pausedAt) return { state: next };
        m.pausedAt = iso(now);
        return { state: next };
      }
      case "resumeMatch": {
        const m = liveMatchOnCourt(next, action.courtNo);
        if (!m) throw new Error("這面場沒有進行中的單打");
        if (!m.pausedAt) return { state: next };
        m.pauseAccumulatedMs += Math.max(0, now - Date.parse(m.pausedAt));
        m.pausedAt = null;
        return { state: next };
      }
      case "extendMatch": {
        const m = liveMatchOnCourt(next, action.courtNo);
        if (!m) throw new Error("這面場沒有進行中的單打");
        m.extendedSec += action.extraSec;
        return { state: next, message: `第 ${action.courtNo} 場延長 ${Math.round(action.extraSec / 60)} 分` };
      }
      case "move": {
        applyMove(next, action.playerIds, action.dest, now);
        return { state: next };
      }
      case "updateSettings": {
        const s: Session = { ...next.session, ...action.patch };
        if (action.patch.courtCount) {
          s.courtCount = Math.min(6, Math.max(1, action.patch.courtCount));
        }
        if (action.patch.weights) s.weights = { ...action.patch.weights };
        next.session = s;
        for (const p of next.players) {
          if (
            p.courtNo != null &&
            p.courtNo > s.courtCount &&
            (p.status === "on_court" || p.status === "queued")
          ) {
            sendToRest(p, now);
          }
        }
        return { state: next, message: "已更新場次設定" };
      }
      case "endSession": {
        for (const m of next.matches) {
          if (m.status === "live") {
            m.status = "cancelled";
            m.endedAt = iso(now);
          }
        }
        next.session.status = "ended";
        return { state: next, message: "場次已結束" };
      }
      case "reopenSession": {
        next.session.status = "active";
        return { state: next, message: "已重開當日看板" };
      }
      default: {
        const _never: never = action;
        return { error: `未知操作: ${JSON.stringify(_never)}` };
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "操作失敗";
    return { error: message };
  }
}

export function newEmptySession(
  session: Session,
): BoardState {
  return { session, players: [], restrictions: [], matches: [] };
}

export function snapshotOf(state: BoardState): BoardState {
  return cloneState(state);
}

export function canFillFromRest(state: BoardState): boolean {
  return state.players.some((p) => p.status === "rest" && !p.locked);
}

export type { Restriction };
