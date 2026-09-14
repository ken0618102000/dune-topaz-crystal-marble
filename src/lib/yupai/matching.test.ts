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
