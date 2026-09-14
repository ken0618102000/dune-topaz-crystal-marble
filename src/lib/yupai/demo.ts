import { newId } from "./ids.ts";
import { WEIGHT_PRESETS } from "./matching.ts";
import type { BoardState, Player, Session } from "./types.ts";

const NAMES: Array<{ nickname: string; skill: number }> = [
  { nickname: "阿明", skill: 10 },
  { nickname: "小美", skill: 13 },
  { nickname: "志偉", skill: 9 },
  { nickname: "佳玲", skill: 16 },
  { nickname: "阿豪", skill: 14 },
  { nickname: "小芬", skill: 6 },
  { nickname: "建宏", skill: 10 },
  { nickname: "雅婷", skill: 13 },
  { nickname: "冠宇", skill: 17 },
  { nickname: "怡君", skill: 9 },
  { nickname: "宗憲", skill: 5 },
  { nickname: "佩珊", skill: 12 },
  { nickname: "小傑", skill: 11 },
];

function p(
  nick: string,
  skill: number,
  patch: Partial<Player>,
): Player {
  return {
    id: newId(),
    nickname: nick,
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

export function buildDemoState(session: Session, now: number): BoardState {
  const iso = (ms: number) => new Date(ms).toISOString();
  const players: Player[] = NAMES.map((n, i) =>
    p(n.nickname, n.skill, {
      sortOrder: i,
      lastWaitStart: iso(now - (18 - i) * 60_000),
      waitTotalSec: (18 - i) * 40,
    }),
  );

  const [a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10, a11, a12] = players;

  a0!.status = "on_court";
  a0!.courtNo = 1;
  a0!.lastWaitStart = null;
  a0!.playCount = 1;
  a1!.status = "on_court";
  a1!.courtNo = 1;
  a1!.lastWaitStart = null;
  a1!.playCount = 1;

  a2!.status = "on_court";
  a2!.courtNo = 2;
  a2!.lastWaitStart = null;
  a2!.playCount = 2;
  a2!.consecutivePlayed = 1;
  a3!.status = "on_court";
  a3!.courtNo = 2;
  a3!.lastWaitStart = null;
  a3!.playCount = 2;
  a3!.consecutivePlayed = 1;

  a4!.status = "queued";
  a4!.courtNo = 1;
  a5!.status = "queued";
  a5!.courtNo = 1;

  a6!.status = "force_rest";
  a6!.consecutivePlayed = 2;
  a6!.playCount = 2;
  a6!.lastOpponentId = a7!.id;

  a11!.status = "not_arrived";
  a11!.lastWaitStart = null;
  a11!.isDropIn = true;

  a12!.status = "rest";
  a12!.locked = false;

  return {
    session: {
      ...session,
      venueName: session.venueName || "鄰里羽球場",
      courtCount: 4,
      matchDurationMin: 12,
      consecutiveLimit: 2,
      forceRestAfterMatch: true,
      scoringEnabled: true,
      weights: { ...WEIGHT_PRESETS.fair },
      weightPreset: "fair",
    },
    players,
    restrictions: [
      {
        id: newId(),
        kind: "blacklist",
        playerAId: a8!.id,
        playerBId: a9!.id,
        used: false,
      },
      {
        id: newId(),
        kind: "preferred",
        playerAId: a9!.id,
        playerBId: a10!.id,
        used: false,
      },
    ],
    matches: [
      {
        id: newId(),
        courtNo: 1,
        playerAId: a0!.id,
        playerBId: a1!.id,
        startedAt: iso(now - 3 * 60_000),
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
      {
        id: newId(),
        courtNo: 2,
        playerAId: a2!.id,
        playerBId: a3!.id,
        startedAt: iso(now - 11 * 60_000),
        endedAt: null,
        source: "manual",
        status: "live",
        winnerId: null,
        scoreA: null,
        scoreB: null,
        durationMin: 12,
        extendedSec: 0,
        pauseAccumulatedMs: 0,
        pausedAt: null,
      },
      {
        id: newId(),
        courtNo: 3,
        playerAId: a6!.id,
        playerBId: a7!.id,
        startedAt: iso(now - 25 * 60_000),
        endedAt: iso(now - 13 * 60_000),
        source: "auto",
        status: "completed",
        winnerId: a6!.id,
        scoreA: 21,
        scoreB: 14,
        durationMin: 12,
        extendedSec: 0,
        pauseAccumulatedMs: 0,
        pausedAt: null,
      },
    ],
  };
}
