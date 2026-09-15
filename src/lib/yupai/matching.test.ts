import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickPairs, pairKey, WEIGHT_PRESETS, type Candidate } from "./matching.ts";
import { applyAction } from "./engine.ts";
import { WEIGHT_PRESETS as PRESETS } from "./matching.ts";
import type { BoardState, Player, Session } from "./types.ts";

function cand(id: string, waitMin: number, playCount: number, skill = 3): Candidate {
  return { id, waitMs: waitMin * 60_000, playCount, skill };
}

function emptySession(over: Partial<Session> = {}): Session {
  return {
    id: "s1",
    code: "TEST01",
    venueName: "測試場",
    sessionDate: "2026-09-14",
    startTime: "19:00",
    endTime: "22:00",
    courtCount: 4,
    matchDurationMin: 12,
    consecutiveLimit: 2,
    forceRestAfterMatch: true,
    banRecentOpponent: false,
    scoringEnabled: false,
    weights: { ...PRESETS.fair },
    weightPreset: "fair",
    status: "active",
    controllerDeviceId: "d1",
    transferPin: null,
    transferPinExpiresAt: null,
    version: 1,
    ...over,
  };
}

function restPlayer(id: string, i: number): Player {
  return {
    id,
    nickname: id,
    skill: 10,
    seedSkill: 10,
    isDropIn: false,
    status: "rest",
    locked: false,
    courtNo: null,
    consecutivePlayed: 0,
    playCount: 0,
    byeCount: 0,
    waitTotalSec: i * 60,
    playTotalSec: 0,
    lastWaitStart: new Date(1_000_000_000_000 - i * 60_000).toISOString(),
    lastOpponentId: null,
    sortOrder: i,
  };
}

describe("pickPairs", () => {
  it("13 人 4 組 → 4 對，其餘等待", () => {
    const candidates = Array.from({ length: 13 }, (_, i) =>
      cand(`p${i}`, 20 - i, 0, 2 + (i % 4)),
    );
    const result = pickPairs({
      candidates,
      slotCount: 4,
      meetings: new Map(),
      lastOpponents: new Map(),
      blacklist: new Set(),
      preferred: [],
      weights: WEIGHT_PRESETS.fair,
      banRecent: false,
    });
    assert.equal(result.pairs.length, 4);
    const used = new Set(result.pairs.flatMap((p) => [p.a, p.b]));
    assert.equal(used.size, 8);
    assert.equal(result.failReason, null);
  });

  it("13 人要 6 組時留下 1 人輪空", () => {
    const candidates = Array.from({ length: 13 }, (_, i) =>
      cand(`p${i}`, 20 - i, 0),
    );
    const result = pickPairs({
      candidates,
      slotCount: 6,
      meetings: new Map(),
      lastOpponents: new Map(),
      blacklist: new Set(),
      preferred: [],
      weights: WEIGHT_PRESETS.fair,
      banRecent: false,
    });
    assert.equal(result.pairs.length, 6);
    assert.ok(result.byeId);
  });

  it("黑名單不可同場", () => {
    const result = pickPairs({
      candidates: [cand("a", 10, 0), cand("b", 9, 0), cand("c", 8, 0)],
      slotCount: 1,
      meetings: new Map(),
      lastOpponents: new Map(),
      blacklist: new Set([pairKey("a", "b")]),
      preferred: [],
      weights: WEIGHT_PRESETS.fair,
      banRecent: false,
    });
    assert.equal(result.pairs.length, 1);
    const pair = result.pairs[0]!;
    const ids = [pair.a, pair.b].sort();
    assert.deepEqual(ids, ["a", "c"]);
  });

  it("指定對戰優先", () => {
    const result = pickPairs({
      candidates: [
        cand("a", 1, 0),
        cand("b", 2, 0),
        cand("c", 50, 0),
        cand("d", 49, 0),
      ],
      slotCount: 1,
      meetings: new Map(),
      lastOpponents: new Map(),
      blacklist: new Set(),
      preferred: [{ id: "pref1", a: "a", b: "b" }],
      weights: WEIGHT_PRESETS.fair,
      banRecent: false,
    });
    assert.equal(result.pairs[0]?.via, "preferred");
    assert.deepEqual([result.pairs[0]!.a, result.pairs[0]!.b].sort(), ["a", "b"]);
  });

  it("同一對手連打兩場後改配別人（人手足夠時）", () => {
    const result = pickPairs({
      candidates: [cand("a", 10, 2), cand("b", 9, 2), cand("c", 8, 0)],
      slotCount: 1,
      meetings: new Map([[pairKey("a", "b"), 2]]),
      lastOpponents: new Map([
        ["a", ["b", "b"]],
        ["b", ["a", "a"]],
      ]),
      blacklist: new Set(),
      preferred: [],
      weights: WEIGHT_PRESETS.fair,
      banRecent: false,
    });
    const pair = result.pairs[0]!;
    const ids = [pair.a, pair.b].sort().join("+");
    assert.notEqual(ids, "a+b");
  });

  it("只剩兩人時仍可互打", () => {
    const result = pickPairs({
      candidates: [cand("a", 10, 4), cand("b", 9, 4)],
      slotCount: 1,
      meetings: new Map([[pairKey("a", "b"), 4]]),
      lastOpponents: new Map([
        ["a", ["b", "b"]],
        ["b", ["a", "a"]],
      ]),
      blacklist: new Set(),
      preferred: [],
      weights: WEIGHT_PRESETS.fair,
      banRecent: true,
    });
    assert.equal(result.pairs.length, 1);
  });

  it("全被黑名單擋住時回報原因", () => {
    const result = pickPairs({
      candidates: [cand("a", 10, 0), cand("b", 9, 0)],
      slotCount: 1,
      meetings: new Map(),
      lastOpponents: new Map(),
      blacklist: new Set([pairKey("a", "b")]),
      preferred: [],
      weights: WEIGHT_PRESETS.fair,
      banRecent: false,
    });
    assert.equal(result.pairs.length, 0);
    assert.equal(result.failReason, "全被硬限制擋下");
  });
});

describe("engine fillNext", () => {
  it("不會拆正在打的兩人", () => {
    const a = restPlayer("liveA", 0);
    const b = restPlayer("liveB", 1);
    a.status = "on_court";
    a.courtNo = 1;
    a.lastWaitStart = null;
    b.status = "on_court";
    b.courtNo = 1;
    b.lastWaitStart = null;
    const rest = Array.from({ length: 11 }, (_, i) => restPlayer(`r${i}`, i + 2));
    const state: BoardState = {
      session: emptySession({ courtCount: 4 }),
      players: [a, b, ...rest],
      restrictions: [],
      matches: [
        {
          id: "m1",
          courtNo: 1,
          playerAId: "liveA",
          playerBId: "liveB",
          startedAt: new Date(1_000_000_000_000).toISOString(),
          endedAt: null,
          source: "auto",
          status: "live",
          winnerId: null,
          scoreA: null,
          scoreB: null,
          durationMin: 12,
          extendedSec: 0,
          pauseAccumulatedMs: 0,
          pausedAt: null,
        },
      ],
    };
    const out = applyAction(state, { type: "fillNext" }, 1_000_000_000_000 + 60_000);
    assert.ok(!("error" in out));
    if ("error" in out) return;
    const liveA = out.state.players.find((p) => p.id === "liveA")!;
    const liveB = out.state.players.find((p) => p.id === "liveB")!;
    assert.equal(liveA.status, "on_court");
    assert.equal(liveB.status, "on_court");
    assert.equal(liveA.courtNo, 1);
    assert.equal(liveB.courtNo, 1);
    const stillLive = out.state.matches.filter((m) => m.status === "live" && m.courtNo === 1);
    assert.equal(stillLive.length, 1);
    assert.equal(stillLive[0]!.id, "m1");
  });

  it("加入即進休息區，2 人 4 面場也能排出 1 組", () => {
    let state: BoardState = {
      session: emptySession({ courtCount: 4 }),
      players: [],
      restrictions: [],
      matches: [],
    };
    const t0 = 1_000_000_000_000;
    const a = applyAction(state, { type: "addPlayer", nickname: "阿明", skill: 10 }, t0);
    assert.ok(!("error" in a));
    state = a.state;
    const b = applyAction(state, { type: "addPlayer", nickname: "小美", skill: 13 }, t0);
    assert.ok(!("error" in b));
    state = b.state;
    assert.equal(state.players.every((p) => p.status === "rest"), true);
    const out = applyAction(state, { type: "fillNext" }, t0 + 60_000);
    assert.ok(!("error" in out));
    if ("error" in out) return;
    assert.equal(out.warning?.includes("人數不足") ?? false, false);
    assert.match(out.message ?? "", /下一場排出 1 組/);
    assert.equal(out.state.matches.filter((m) => m.status === "live").length, 0);
    assert.equal(out.state.players.filter((p) => p.status === "queued").length, 2);
    assert.equal(out.state.players.filter((p) => p.status === "on_court").length, 0);
  });

  it("4 面場只有 4 人時先排進下一場，不直接上場", () => {
    const state: BoardState = {
      session: emptySession({ courtCount: 4 }),
      players: Array.from({ length: 4 }, (_, i) => restPlayer(`p${i}`, i)),
      restrictions: [],
      matches: [],
    };
    const out = applyAction(state, { type: "fillNext" }, 1_000_000_000_000 + 60_000);
    assert.ok(!("error" in out));
    if ("error" in out) return;
    assert.ok(!(out.warning ?? "").includes("人數不足"));
    assert.match(out.message ?? "", /下一場排出 2 組/);
    assert.equal(out.state.matches.filter((m) => m.status === "live").length, 0);
    assert.equal(out.state.players.filter((p) => p.status === "queued").length, 4);
    const again = applyAction(out.state, { type: "fillNext" }, 1_000_000_000_000 + 120_000);
    assert.ok(!("error" in again));
    if ("error" in again) return;
    assert.equal(again.state.matches.filter((m) => m.status === "live").length, 2);
    assert.match(again.message ?? "", /上場 2 組/);
  });

  it("未到球員不會被排，會提示簽到", () => {
    const a = restPlayer("a", 0);
    const b = restPlayer("b", 1);
    a.status = "not_arrived";
    b.status = "not_arrived";
    a.lastWaitStart = null;
    b.lastWaitStart = null;
    const state: BoardState = {
      session: emptySession({ courtCount: 4 }),
      players: [a, b],
      restrictions: [],
      matches: [],
    };
    const out = applyAction(state, { type: "fillNext" }, 1_000_000_000_000);
    assert.ok(!("error" in out));
    if ("error" in out) return;
    assert.ok((out.warning ?? "").includes("未簽到"));
    assert.equal(out.state.matches.filter((m) => m.status === "live").length, 0);
  });

  it("沒有球員時提示先加入", () => {
    const state: BoardState = {
      session: emptySession({ courtCount: 4 }),
      players: [],
      restrictions: [],
      matches: [],
    };
    const out = applyAction(state, { type: "fillNext" }, 1_000_000_000_000);
    assert.ok(!("error" in out));
    if ("error" in out) return;
    assert.ok((out.warning ?? "").includes("還沒有球員"));
  });

  it("下場後空場，排下一場先進化下一場再上場", () => {
    let state: BoardState = {
      session: emptySession({ courtCount: 2, forceRestAfterMatch: true }),
      players: [restPlayer("a", 0), restPlayer("b", 1)],
      restrictions: [],
      matches: [],
    };
    const t0 = 1_000_000_000_000;
    const staged = applyAction(state, { type: "fillNext" }, t0);
    assert.ok(!("error" in staged));
    state = staged.state;
    const started = applyAction(state, { type: "fillNext" }, t0 + 1_000);
    assert.ok(!("error" in started));
    state = started.state;
    assert.equal(state.matches.filter((m) => m.status === "live").length, 1);
    const ended = applyAction(
      state,
      { type: "endMatch", courtNo: 1, scoreA: 21, scoreB: 15 },
      t0 + 12 * 60_000,
    );
    assert.ok(!("error" in ended));
    if ("error" in ended) return;
    assert.equal(ended.state.players.filter((p) => p.status === "force_rest").length, 2);
    assert.equal(ended.state.matches.filter((m) => m.status === "live").length, 0);
    const again = applyAction(ended.state, { type: "fillNext" }, t0 + 13 * 60_000);
    assert.ok(!("error" in again));
    if ("error" in again) return;
    assert.equal(again.state.matches.filter((m) => m.status === "live").length, 0);
    assert.equal(again.state.players.filter((p) => p.status === "queued").length, 2);
    assert.match(again.message ?? "", /下一場排出 1 組/);
  });

  it("只有一面空場時休息區先進化下一場，剛下場的人這輪休息", () => {
    const w1 = restPlayer("w1", 0);
    const w2 = restPlayer("w2", 1);
    const d1 = restPlayer("d1", 2);
    const d2 = restPlayer("d2", 3);
    d1.status = "force_rest";
    d2.status = "force_rest";
    const state: BoardState = {
      session: emptySession({ courtCount: 1, forceRestAfterMatch: true }),
      players: [w1, w2, d1, d2],
      restrictions: [],
      matches: [],
    };
    const out = applyAction(state, { type: "fillNext" }, 1_000_000_000_000 + 60_000);
    assert.ok(!("error" in out));
    if ("error" in out) return;
    const queued = out.state.players.filter((p) => p.status === "queued").map((p) => p.id).sort();
    assert.deepEqual(queued, ["w1", "w2"]);
    assert.equal(out.state.players.filter((p) => p.status === "on_court").length, 0);
    assert.equal(out.state.players.filter((p) => p.status === "force_rest").length, 0);
    const resting = out.state.players.filter((p) => p.status === "rest").map((p) => p.id).sort();
    assert.deepEqual(resting, ["d1", "d2"]);
  });

  it("空場已有下一場兩人時讓他們上場，休息區只進下一場", () => {
    const q1 = restPlayer("q1", 0);
    const q2 = restPlayer("q2", 1);
    q1.status = "queued";
    q1.courtNo = 1;
    q1.lastWaitStart = null;
    q2.status = "queued";
    q2.courtNo = 1;
    q2.lastWaitStart = null;
    const state: BoardState = {
      session: emptySession({ courtCount: 2 }),
      players: [q1, q2, restPlayer("r1", 2), restPlayer("r2", 3)],
      restrictions: [],
      matches: [],
    };
    const out = applyAction(state, { type: "fillNext" }, 1_000_000_000_000 + 60_000);
    assert.ok(!("error" in out));
    if ("error" in out) return;
    const on1 = out.state.players
      .filter((p) => p.status === "on_court" && p.courtNo === 1)
      .map((p) => p.id)
      .sort();
    assert.deepEqual(on1, ["q1", "q2"]);
    assert.equal(out.state.matches.filter((m) => m.status === "live").length, 1);
    const queued = out.state.players.filter((p) => p.status === "queued").map((p) => p.id).sort();
    assert.deepEqual(queued, ["r1", "r2"]);
    assert.match(out.message ?? "", /上場 1 組/);
    assert.match(out.message ?? "", /下一場排出 1 組/);
  });

  it("空場會抽其他場的下一場上場", () => {
    const a = restPlayer("a", 0);
    const b = restPlayer("b", 1);
    a.status = "on_court";
    a.courtNo = 2;
    a.lastWaitStart = null;
    b.status = "on_court";
    b.courtNo = 2;
    b.lastWaitStart = null;
    const c = restPlayer("c", 2);
    const d = restPlayer("d", 3);
    c.status = "queued";
    c.courtNo = 2;
    c.lastWaitStart = null;
    d.status = "queued";
    d.courtNo = 2;
    d.lastWaitStart = null;
    const state: BoardState = {
      session: emptySession({ courtCount: 2 }),
      players: [a, b, c, d],
      restrictions: [],
      matches: [
        {
          id: "m2",
          courtNo: 2,
          playerAId: "a",
          playerBId: "b",
          startedAt: new Date(1_000_000_000_000).toISOString(),
          endedAt: null,
          source: "auto",
          status: "live",
          winnerId: null,
          scoreA: null,
          scoreB: null,
          durationMin: 12,
          extendedSec: 0,
          pauseAccumulatedMs: 0,
          pausedAt: null,
        },
      ],
    };
    const out = applyAction(state, { type: "fillNext" }, 1_000_000_000_000 + 60_000);
    assert.ok(!("error" in out));
    if ("error" in out) return;
    const on1 = out.state.players
      .filter((p) => p.status === "on_court" && p.courtNo === 1)
      .map((p) => p.id)
      .sort();
    assert.deepEqual(on1, ["c", "d"]);
    assert.equal(out.state.players.find((p) => p.id === "a")!.courtNo, 2);
    assert.equal(out.state.matches.filter((m) => m.status === "live").length, 2);
  });

  it("人已在打時再排會說明空場原因", () => {
    const a = restPlayer("a", 0);
    const b = restPlayer("b", 1);
    a.status = "on_court";
    a.courtNo = 1;
    a.lastWaitStart = null;
    b.status = "on_court";
    b.courtNo = 1;
    b.lastWaitStart = null;
    const state: BoardState = {
      session: emptySession({ courtCount: 4 }),
      players: [a, b],
      restrictions: [],
      matches: [
        {
          id: "m1",
          courtNo: 1,
          playerAId: "a",
          playerBId: "b",
          startedAt: new Date(1_000_000_000_000).toISOString(),
          endedAt: null,
          source: "auto",
          status: "live",
          winnerId: null,
          scoreA: null,
          scoreB: null,
          durationMin: 12,
          extendedSec: 0,
          pauseAccumulatedMs: 0,
          pausedAt: null,
        },
      ],
    };
    const out = applyAction(state, { type: "fillNext" }, 1_000_000_000_000 + 60_000);
    assert.ok(!("error" in out));
    if ("error" in out) return;
    assert.equal(out.state.matches.filter((m) => m.status === "live").length, 1);
    assert.ok((out.warning ?? "").includes("休息區沒人可排下一場"));
  });

  it("公平權重下上場次數差會收斂", () => {
    const n = 13;
    const stats = Array.from({ length: n }, (_, i) => ({
      id: `p${i}`,
      waitMs: (n - i) * 60_000,
      playCount: 0,
      skill: 2 + (i % 4),
      byeCount: 0,
    }));
    const meetings = new Map<string, number>();
    const lastOpponents = new Map<string, string[]>();
    const byes = new Set<string>();
    for (let round = 0; round < 20; round++) {
      const result = pickPairs({
        candidates: stats.map((s) => ({
          id: s.id,
          waitMs: s.waitMs,
          playCount: s.playCount,
          skill: s.skill,
        })),
        slotCount: 4,
        meetings,
        lastOpponents,
        blacklist: new Set(),
        preferred: [],
        weights: WEIGHT_PRESETS.fair,
        banRecent: false,
      });
      const playing = new Set(result.pairs.flatMap((p) => [p.a, p.b]));
      for (const pair of result.pairs) {
        const k = pairKey(pair.a, pair.b);
        meetings.set(k, (meetings.get(k) ?? 0) + 1);
        const push = (id: string, opp: string) => {
          const arr = lastOpponents.get(id) ?? [];
          arr.push(opp);
          lastOpponents.set(id, arr.slice(-2));
        };
        push(pair.a, pair.b);
        push(pair.b, pair.a);
      }
      for (const s of stats) {
        if (playing.has(s.id)) {
          s.playCount += 1;
          s.waitMs = 0;
        } else {
          s.waitMs += 12 * 60_000;
          s.byeCount += 1;
          byes.add(s.id);
        }
      }
      if (result.byeId) byes.add(result.byeId);
    }
    const plays = stats.map((s) => s.playCount);
    assert.ok(Math.max(...plays) - Math.min(...plays) <= 1);
    assert.ok(byes.size >= 8);
  });
});
