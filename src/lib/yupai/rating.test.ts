import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyAction } from "./engine.ts";
import { WEIGHT_PRESETS } from "./matching.ts";
import { applyMatchRating, expectedScore } from "./rating.ts";
import type { BoardState, Player, Session } from "./types.ts";

describe("applyMatchRating", () => {
  it("程度相同、小分差 → 幾乎不動", () => {
    const u = applyMatchRating({
      skillA: 10,
      skillB: 10,
      scoreA: 21,
      scoreB: 19,
    });
    assert.ok(u);
    assert.ok(Math.abs(u!.deltaA) < 0.15);
    assert.equal(u!.deltaB, -u!.deltaA);
  });

  it("低打贏高 → 勝者升、敗者降，且幅度大於熱門贏球", () => {
    const upset = applyMatchRating({
      skillA: 8,
      skillB: 14,
      scoreA: 21,
      scoreB: 12,
    });
    const favorite = applyMatchRating({
      skillA: 14,
      skillB: 8,
      scoreA: 21,
      scoreB: 12,
    });
    assert.ok(upset && favorite);
    assert.ok(upset.deltaA > favorite.deltaA);
    assert.ok(upset.deltaA > 0.2);
    assert.ok(upset.deltaB < 0);
  });

  it("沒有比分也沒有勝負 → 不調整", () => {
    assert.equal(
      applyMatchRating({ skillA: 10, skillB: 12 }),
      null,
    );
  });

  it("只記勝負也會動", () => {
    const u = applyMatchRating({ skillA: 10, skillB: 10, winner: "a" });
    assert.ok(u);
    assert.ok(u!.deltaA > 0.2);
    assert.equal(u!.skillA, 10 + u!.deltaA);
  });

  it("不會超出 1–18", () => {
    const top = applyMatchRating({
      skillA: 18,
      skillB: 10,
      scoreA: 21,
      scoreB: 0,
    });
    const bot = applyMatchRating({
      skillA: 1,
      skillB: 10,
      scoreA: 0,
      scoreB: 21,
    });
    assert.equal(top!.skillA, 18);
    assert.equal(bot!.skillA, 1);
  });

  it("4 級差期望勝率接近九成", () => {
    const e = expectedScore(14, 10);
    assert.ok(e > 0.85 && e < 0.95);
  });
});

function session(): Session {
  return {
    id: "s1",
    code: "TEST01",
    venueName: "測試場",
    sessionDate: "2026-09-14",
    startTime: "19:00",
    endTime: "22:00",
    courtCount: 1,
    matchDurationMin: 12,
    consecutiveLimit: 2,
    forceRestAfterMatch: true,
    banRecentOpponent: false,
    scoringEnabled: true,
    weights: { ...WEIGHT_PRESETS.fair },
    weightPreset: "fair",
    status: "active",
    controllerDeviceId: "d1",
    transferPin: null,
    transferPinExpiresAt: null,
    version: 1,
  };
}

function p(id: string, skill: number, patch: Partial<Player> = {}): Player {
  return {
    id,
    nickname: id,
    skill,
    seedSkill: skill,
    isDropIn: false,
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
    sortOrder: 0,
    ...patch,
  };
}

describe("engine endMatch 依比分調程度", () => {
  it("記下比分後兩人程度會反向移動", () => {
    const a = p("a", 10, { status: "on_court", courtNo: 1 });
    const b = p("b", 10, { status: "on_court", courtNo: 1 });
    const state: BoardState = {
      session: session(),
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
    const out = applyAction(
      state,
      { type: "endMatch", courtNo: 1, scoreA: 21, scoreB: 8 },
      1_000_000_000_000 + 12 * 60_000,
    );
    assert.ok(!("error" in out));
    if ("error" in out) return;
    const na = out.state.players.find((x) => x.id === "a")!;
    const nb = out.state.players.find((x) => x.id === "b")!;
    assert.ok(na.skill > 10);
    assert.ok(nb.skill < 10);
    assert.equal(na.seedSkill, 10);
    assert.equal(out.state.matches[0]!.scoreA, 21);
    assert.equal(out.state.matches[0]!.winnerId, "a");
  });
});
