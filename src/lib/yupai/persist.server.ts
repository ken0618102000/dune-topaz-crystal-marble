import { getSql, type Sql } from "@/lib/db";
import { applyAction, snapshotOf } from "./engine.ts";
import { buildDemoState } from "./demo.ts";
import { hostToken, newId, sessionCode, transferPin } from "./ids.ts";
import { WEIGHT_PRESETS } from "./matching.ts";
import type {
  BoardAction,
  BoardPayload,
  BoardState,
  CreateSessionInput,
  Match,
  Player,
  Restriction,
  Session,
  Weights,
} from "./types.ts";

function asBool(v: unknown): boolean {
  return v === true || v === "t" || v === "true";
}

function asNum(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function asInt(v: unknown, fallback = 0): number {
  return Math.round(asNum(v, fallback));
}

function asIso(v: unknown): string | null {
  if (v == null || v === "") return null;
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function asText(v: unknown): string {
  return v == null ? "" : String(v);
}

type SessionRow = Record<string, unknown>;

function weightsFromRow(row: SessionRow): Weights {
  return {
    wait: asInt(row.weight_wait, 4),
    plays: asInt(row.weight_plays, 4),
    rematch: asInt(row.weight_rematch, 3),
    skill: asInt(row.weight_skill, 1),
  };
}

function sessionFromRow(row: SessionRow): Session {
  const preset = asText(row.weight_preset);
  return {
    id: asText(row.id),
    code: asText(row.code),
    venueName: asText(row.venue_name),
    sessionDate: asText(row.session_date).slice(0, 10),
    startTime: asText(row.start_time),
    endTime: asText(row.end_time),
    courtCount: asInt(row.court_count, 4),
    matchDurationMin: asInt(row.match_duration_min, 12),
    consecutiveLimit: asInt(row.consecutive_limit, 2),
    forceRestAfterMatch: asBool(row.force_rest_after_match),
    banRecentOpponent: asBool(row.ban_recent_opponent),
    scoringEnabled: asBool(row.scoring_enabled),
    weights: weightsFromRow(row),
    weightPreset: preset === "intensity" || preset === "custom" ? preset : "fair",
    status: asText(row.status) === "ended" ? "ended" : "active",
    controllerDeviceId: row.controller_device_id ? asText(row.controller_device_id) : null,
    transferPin: row.transfer_pin ? asText(row.transfer_pin) : null,
    transferPinExpiresAt: asIso(row.transfer_pin_expires_at),
    version: asInt(row.version, 1),
  };
}

function playerFromRow(row: Record<string, unknown>): Player {
  return {
    id: asText(row.id),
    nickname: asText(row.nickname),
    skill: asNum(row.skill_rating ?? row.skill, 10),
    seedSkill: asNum(row.seed_skill ?? row.skill_rating ?? row.skill, 10),
    isDropIn: asBool(row.is_drop_in),
    status: asText(row.status) as Player["status"],
    locked: asBool(row.locked),
    courtNo: row.court_no == null ? null : asInt(row.court_no),
    consecutivePlayed: asInt(row.consecutive_played),
    playCount: asInt(row.play_count),
    byeCount: asInt(row.bye_count),
    waitTotalSec: asInt(row.wait_total_sec),
    playTotalSec: asInt(row.play_total_sec),
    lastWaitStart: asIso(row.last_wait_start),
    lastOpponentId: row.last_opponent_id ? asText(row.last_opponent_id) : null,
    sortOrder: asInt(row.sort_order),
  };
}

function restrictionFromRow(row: Record<string, unknown>): Restriction {
  return {
    id: asText(row.id),
    kind: asText(row.kind) === "preferred" ? "preferred" : "blacklist",
    playerAId: asText(row.player_a_id),
    playerBId: asText(row.player_b_id),
    used: asBool(row.used),
  };
}

function matchFromRow(row: Record<string, unknown>): Match {
  const status = asText(row.status);
  return {
    id: asText(row.id),
    courtNo: asInt(row.court_no),
    playerAId: asText(row.player_a_id),
    playerBId: asText(row.player_b_id),
    startedAt: asIso(row.started_at),
    endedAt: asIso(row.ended_at),
    source: asText(row.source) === "auto" ? "auto" : "manual",
    status:
      status === "completed" || status === "cancelled" ? status : "live",
    winnerId: row.winner_id ? asText(row.winner_id) : null,
    scoreA: row.score_a == null ? null : asInt(row.score_a),
    scoreB: row.score_b == null ? null : asInt(row.score_b),
    durationMin: asInt(row.duration_min, 12),
    extendedSec: asInt(row.extended_sec),
    pauseAccumulatedMs: asInt(row.pause_accumulated_ms),
    pausedAt: asIso(row.paused_at),
  };
}

async function loadRow(sql: Sql, code: string): Promise<SessionRow | null> {
  const rows = await sql.query<SessionRow>(
    "select * from yupai_sessions where code = $1",
    [code.trim().toUpperCase()],
  );
  return rows[0] ?? null;
}

export async function loadState(code: string): Promise<{
  row: SessionRow;
  state: BoardState;
  hostToken: string;
  canUndo: boolean;
} | null> {
  const sql = await getSql();
  const row = await loadRow(sql, code);
  if (!row) return null;
  const sessionId = asText(row.id);
  const [players, restrictions, matches, ops] = await Promise.all([
    sql.query("select * from yupai_players where session_id = $1 order by sort_order, created_at", [sessionId]),
    sql.query("select * from yupai_restrictions where session_id = $1", [sessionId]),
    sql.query("select * from yupai_matches where session_id = $1 order by created_at", [sessionId]),
    sql.query("select id from yupai_ops where session_id = $1 limit 1", [sessionId]),
  ]);
  return {
    row,
    hostToken: asText(row.host_token),
    canUndo: ops.length > 0,
    state: {
      session: sessionFromRow(row),
      players: players.map(playerFromRow),
      restrictions: restrictions.map(restrictionFromRow),
      matches: matches.map(matchFromRow),
    },
  };
}

function flags(
  loaded: { state: BoardState; hostToken: string; canUndo: boolean },
  givenToken?: string,
  deviceId?: string,
) {
  const isHost = Boolean(givenToken && givenToken === loaded.hostToken);
  const isController = Boolean(
    isHost &&
      deviceId &&
      loaded.state.session.controllerDeviceId === deviceId,
  );
  return { isHost, isController };
}

export function boardPayload(
  loaded: { state: BoardState; hostToken: string; canUndo: boolean },
  givenToken?: string,
  deviceId?: string,
  extra?: { message?: string; warning?: string; conflict?: boolean },
): BoardPayload {
  const { isHost, isController } = flags(loaded, givenToken, deviceId);
  return {
    session: {
      ...loaded.state.session,
      transferPin: isHost ? loaded.state.session.transferPin : null,
    },
    players: loaded.state.players,
    restrictions: loaded.state.restrictions,
    matches: loaded.state.matches,
    version: loaded.state.session.version,
    canUndo: loaded.canUndo,
    isHost,
    isController,
    youAreHost: isHost,
    ...extra,
  };
}

async function writeState(sql: Sql, state: BoardState) {
  const s = state.session;
  await sql.query(
    `update yupai_sessions set
      venue_name = $2,
      session_date = $3,
      start_time = $4,
      end_time = $5,
      court_count = $6,
      match_duration_min = $7,
      consecutive_limit = $8,
      force_rest_after_match = $9,
      ban_recent_opponent = $10,
      scoring_enabled = $11,
      weight_wait = $12,
      weight_plays = $13,
      weight_rematch = $14,
      weight_skill = $15,
      weight_preset = $16,
      status = $17,
      controller_device_id = $18,
      transfer_pin = $19,
      transfer_pin_expires_at = $20,
      updated_at = now()
    where id = $1`,
    [
      s.id,
      s.venueName,
      s.sessionDate,
      s.startTime,
      s.endTime,
      s.courtCount,
      s.matchDurationMin,
      s.consecutiveLimit,
      s.forceRestAfterMatch,
      s.banRecentOpponent,
      s.scoringEnabled,
      s.weights.wait,
      s.weights.plays,
      s.weights.rematch,
      s.weights.skill,
      s.weightPreset,
      s.status,
      s.controllerDeviceId,
      s.transferPin,
      s.transferPinExpiresAt,
    ],
  );

  await sql.query("delete from yupai_players where session_id = $1", [s.id]);
  for (const p of state.players) {
    await sql.query(
      `insert into yupai_players (
        id, session_id, nickname, skill, skill_rating, seed_skill, is_drop_in, status, locked, court_no,
        consecutive_played, play_count, bye_count, wait_total_sec, play_total_sec,
        last_wait_start, last_opponent_id, sort_order
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
      [
        p.id,
        s.id,
        p.nickname,
        Math.round(p.skill),
        p.skill,
        p.seedSkill ?? p.skill,
        p.isDropIn,
        p.status,
        p.locked,
        p.courtNo,
        p.consecutivePlayed,
        p.playCount,
        p.byeCount,
        p.waitTotalSec,
        p.playTotalSec,
        p.lastWaitStart,
        p.lastOpponentId,
        p.sortOrder,
      ],
    );
  }

  await sql.query("delete from yupai_restrictions where session_id = $1", [s.id]);
  for (const r of state.restrictions) {
    await sql.query(
      `insert into yupai_restrictions (id, session_id, kind, player_a_id, player_b_id, used)
       values ($1,$2,$3,$4,$5,$6)`,
      [r.id, s.id, r.kind, r.playerAId, r.playerBId, r.used],
    );
  }

  await sql.query("delete from yupai_matches where session_id = $1", [s.id]);
  for (const m of state.matches) {
    await sql.query(
      `insert into yupai_matches (
        id, session_id, court_no, player_a_id, player_b_id, started_at, ended_at,
        source, status, winner_id, score_a, score_b, duration_min, extended_sec,
        pause_accumulated_ms, paused_at
      ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [
        m.id,
        s.id,
        m.courtNo,
        m.playerAId,
        m.playerBId,
        m.startedAt,
        m.endedAt,
        m.source,
        m.status,
        m.winnerId,
        m.scoreA,
        m.scoreB,
        m.durationMin,
        m.extendedSec,
        m.pauseAccumulatedMs,
        m.pausedAt,
      ],
    );
  }
}

async function casVersion(sql: Sql, sessionId: string, expected: number): Promise<number | null> {
  const rows = await sql.query<{ version: number }>(
    `update yupai_sessions set version = version + 1, updated_at = now()
     where id = $1 and version = $2 returning version`,
    [sessionId, expected],
  );
  return rows[0]?.version ?? null;
}

async function pushUndo(sql: Sql, sessionId: string, action: string, before: BoardState) {
  await sql.query(
    "insert into yupai_ops (id, session_id, action, before_json) values ($1,$2,$3,$4)",
    [newId(), sessionId, action, snapshotOf(before)],
  );
}

export async function createSessionRecord(input: CreateSessionInput) {
  const sql = await getSql();
  const id = newId();
  const token = hostToken();
  let code = sessionCode();
  const weights = input.weights ?? WEIGHT_PRESETS.fair;
  for (let i = 0; i < 6; i++) {
    try {
      await sql.query(
        `insert into yupai_sessions (
          id, code, host_token, venue_name, session_date, start_time, end_time,
          court_count, match_duration_min, consecutive_limit, force_rest_after_match,
          ban_recent_opponent, scoring_enabled, weight_wait, weight_plays,
          weight_rematch, weight_skill, weight_preset, controller_device_id
        ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [
          id,
          code,
          token,
          input.venueName.trim() || "羽球場",
          input.sessionDate,
          input.startTime,
          input.endTime,
          Math.min(6, Math.max(1, input.courtCount)),
          input.matchDurationMin,
          input.consecutiveLimit,
          input.forceRestAfterMatch,
          input.banRecentOpponent,
          input.scoringEnabled,
          weights.wait,
          weights.plays,
          weights.rematch,
          weights.skill,
          input.weightPreset,
          input.deviceId,
        ],
      );
      return { id, code, hostToken: token };
    } catch {
      code = sessionCode();
    }
  }
  throw new Error("無法建立場次，請再試一次");
}

export async function seedDemo(input: CreateSessionInput) {
  const created = await createSessionRecord(input);
  const loaded = await loadState(created.code);
  if (!loaded) throw new Error("示範場次建立失敗");
  const demo = buildDemoState(loaded.state.session, Date.now());
  const sql = await getSql();
  await writeState(sql, demo);
  const again = await loadState(created.code);
  if (!again) throw new Error("示範場次讀取失敗");
  return { created, payload: boardPayload(again, created.hostToken, input.deviceId) };
}

export async function fetchBoard(input: {
  code: string;
  hostToken?: string;
  deviceId?: string;
}): Promise<BoardPayload | { error: string }> {
  const loaded = await loadState(input.code);
  if (!loaded) return { error: "找不到這個場次碼" };
  return boardPayload(loaded, input.hostToken, input.deviceId);
}

export async function mutateBoard(input: {
  code: string;
  hostToken: string;
  deviceId: string;
  expectedVersion: number;
  action: BoardAction;
}): Promise<BoardPayload | { error: string }> {
  const loaded = await loadState(input.code);
  if (!loaded) return { error: "找不到這個場次碼" };
  if (input.hostToken !== loaded.hostToken) {
    return { error: "沒有主控權限" };
  }
  if (loaded.state.session.controllerDeviceId !== input.deviceId) {
    return { error: "主控已在另一台裝置。請先取得主控。" };
  }

  const sql = await getSql();
  const newVersion = await casVersion(sql, loaded.state.session.id, input.expectedVersion);
  if (newVersion == null) {
    const fresh = await loadState(input.code);
    if (!fresh) return { error: "找不到這個場次碼" };
    return boardPayload(fresh, input.hostToken, input.deviceId, {
      conflict: true,
      warning: "看板已由其他操作更新，未套用這一步",
    });
  }

  const before = snapshotOf(loaded.state);
  const result = applyAction(loaded.state, input.action);
  if ("error" in result) {
    await sql.query(
      "update yupai_sessions set version = $2 where id = $1",
      [loaded.state.session.id, input.expectedVersion],
    );
    return { error: result.error };
  }

  result.state.session.version = newVersion;
  await pushUndo(sql, result.state.session.id, input.action.type, before);
  await writeState(sql, result.state);
  const fresh = await loadState(input.code);
  if (!fresh) return { error: "寫入後讀取失敗" };
  return boardPayload(fresh, input.hostToken, input.deviceId, {
    message: result.message,
    warning: result.warning,
  });
}

export async function undoBoard(input: {
  code: string;
  hostToken: string;
  deviceId: string;
  expectedVersion: number;
}): Promise<BoardPayload | { error: string }> {
  const loaded = await loadState(input.code);
  if (!loaded) return { error: "找不到這個場次碼" };
  if (input.hostToken !== loaded.hostToken) return { error: "沒有主控權限" };
  if (loaded.state.session.controllerDeviceId !== input.deviceId) {
    return { error: "主控已在另一台裝置。請先取得主控。" };
  }
  const sql = await getSql();
  const ops = await sql.query<{ id: string; before_json: unknown }>(
    "select id, before_json from yupai_ops where session_id = $1 order by created_at desc limit 1",
    [loaded.state.session.id],
  );
  const op = ops[0];
  if (!op) return { error: "沒有可撤銷的步驟" };

  const newVersion = await casVersion(sql, loaded.state.session.id, input.expectedVersion);
  if (newVersion == null) {
    const fresh = await loadState(input.code);
    if (!fresh) return { error: "找不到這個場次碼" };
    return boardPayload(fresh, input.hostToken, input.deviceId, {
      conflict: true,
      warning: "看板已更新，撤銷未套用",
    });
  }

  const raw = typeof op.before_json === "string" ? JSON.parse(op.before_json) : op.before_json;
  const restored = raw as BoardState;
  restored.session.version = newVersion;
  restored.session.id = loaded.state.session.id;
  restored.session.code = loaded.state.session.code;
  await writeState(sql, restored);
  await sql.query("delete from yupai_ops where id = $1", [op.id]);
  const fresh = await loadState(input.code);
  if (!fresh) return { error: "撤銷後讀取失敗" };
  return boardPayload(fresh, input.hostToken, input.deviceId, { message: "已撤銷上一步" });
}

export async function claimControl(input: {
  code: string;
  hostToken: string;
  deviceId: string;
}): Promise<BoardPayload | { error: string }> {
  const loaded = await loadState(input.code);
  if (!loaded) return { error: "找不到這個場次碼" };
  if (input.hostToken !== loaded.hostToken) return { error: "主控密鑰不正確" };
  const sql = await getSql();
  await sql.query(
    "update yupai_sessions set controller_device_id = $2, transfer_pin = null, transfer_pin_expires_at = null, version = version + 1 where id = $1",
    [loaded.state.session.id, input.deviceId],
  );
  const fresh = await loadState(input.code);
  if (!fresh) return { error: "讀取失敗" };
  return boardPayload(fresh, input.hostToken, input.deviceId, { message: "已取得主控" });
}

export async function startHostTransfer(input: {
  code: string;
  hostToken: string;
  deviceId: string;
}): Promise<{ pin: string } | { error: string }> {
  const loaded = await loadState(input.code);
  if (!loaded) return { error: "找不到這個場次碼" };
  if (input.hostToken !== loaded.hostToken) return { error: "沒有主控權限" };
  if (loaded.state.session.controllerDeviceId !== input.deviceId) {
    return { error: "請用目前主控裝置移交" };
  }
  const pin = transferPin();
  const sql = await getSql();
  const expires = new Date(Date.now() + 5 * 60_000).toISOString();
  await sql.query(
    "update yupai_sessions set transfer_pin = $2, transfer_pin_expires_at = $3, version = version + 1 where id = $1",
    [loaded.state.session.id, pin, expires],
  );
  return { pin };
}

export async function acceptHostTransfer(input: {
  code: string;
  pin: string;
  deviceId: string;
}): Promise<{ payload: BoardPayload; hostToken: string } | { error: string }> {
  const loaded = await loadState(input.code);
  if (!loaded) return { error: "找不到這個場次碼" };
  const pin = input.pin.trim();
  if (!loaded.state.session.transferPin || loaded.state.session.transferPin !== pin) {
    return { error: "移交碼不正確" };
  }
  const exp = loaded.state.session.transferPinExpiresAt;
  if (exp && Date.parse(exp) < Date.now()) return { error: "移交碼已過期" };
  const sql = await getSql();
  await sql.query(
    "update yupai_sessions set controller_device_id = $2, transfer_pin = null, transfer_pin_expires_at = null, version = version + 1 where id = $1",
    [loaded.state.session.id, input.deviceId],
  );
  const fresh = await loadState(input.code);
  if (!fresh) return { error: "讀取失敗" };
  return {
    hostToken: fresh.hostToken,
    payload: boardPayload(fresh, fresh.hostToken, input.deviceId, {
      message: "已接下主控",
    }),
  };
}
