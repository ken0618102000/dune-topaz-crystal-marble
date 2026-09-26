import { z } from "zod";
import { PLAYER_STATUSES } from "./types.ts";

const id = z.string().min(1).max(80);
const nickname = z.string().trim().min(1).max(16);
const skill = z.number().finite().min(1).max(18);

const weights = z.object({
  wait: z.number().min(0).max(8),
  plays: z.number().min(0).max(8),
  rematch: z.number().min(0).max(8),
  skill: z.number().min(0).max(8),
});

const dropDest = z.discriminatedUnion("zone", [
  z.object({ zone: z.literal("rest") }),
  z.object({
    zone: z.literal("court"),
    courtNo: z.number().int().min(1).max(6),
    replacePlayerId: id.optional(),
  }),
  z.object({
    zone: z.literal("queue"),
    courtNo: z.number().int().min(1).max(6),
    replacePlayerId: id.optional(),
  }),
]);

const settingsPatch = z
  .object({
    venueName: z.string().trim().min(1).max(40),
    sessionDate: z.string().min(8).max(12),
    startTime: z.string().min(4).max(8),
    endTime: z.string().min(4).max(8),
    courtCount: z.number().int().min(1).max(6),
    matchDurationMin: z.number().int().min(5).max(30),
    consecutiveLimit: z.number().int().min(1).max(6),
    forceRestAfterMatch: z.boolean(),
    banRecentOpponent: z.boolean(),
    scoringEnabled: z.boolean(),
    weights,
    weightPreset: z.enum(["fair", "intensity", "custom"]),
  })
  .partial();

export const boardActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("addPlayer"),
    nickname,
    skill,
    isDropIn: z.boolean().optional(),
  }),
  z.object({ type: z.literal("renamePlayer"), playerId: id, nickname }),
  z.object({ type: z.literal("removePlayer"), playerId: id }),
  z.object({
    type: z.literal("setStatus"),
    playerId: id,
    status: z.enum(PLAYER_STATUSES),
  }),
  z.object({ type: z.literal("setLocked"), playerId: id, locked: z.boolean() }),
  z.object({ type: z.literal("setSkill"), playerId: id, skill }),
  z.object({
    type: z.literal("importPlayers"),
    rows: z
      .array(z.object({ nickname, skill, isDropIn: z.boolean() }))
      .max(200),
  }),
  z.object({
    type: z.literal("addRestriction"),
    kind: z.enum(["blacklist", "preferred"]),
    playerAId: id,
    playerBId: id,
  }),
  z.object({ type: z.literal("removeRestriction"), id }),
  z.object({ type: z.literal("checkInAll") }),
  z.object({ type: z.literal("fillNext") }),
  z.object({ type: z.literal("stageQueue") }),
  z.object({ type: z.literal("promoteQueue") }),
  z.object({ type: z.literal("reshuffleNext") }),
  z.object({
    type: z.literal("endMatch"),
    courtNo: z.number().int().min(1).max(6),
    winnerId: id.nullable().optional(),
    scoreA: z.number().int().min(0).max(30).nullable().optional(),
    scoreB: z.number().int().min(0).max(30).nullable().optional(),
  }),
  z.object({ type: z.literal("pauseMatch"), courtNo: z.number().int().min(1).max(6) }),
  z.object({ type: z.literal("resumeMatch"), courtNo: z.number().int().min(1).max(6) }),
  z.object({
    type: z.literal("extendMatch"),
    courtNo: z.number().int().min(1).max(6),
    extraSec: z.number().int().min(30).max(600),
  }),
  z.object({
    type: z.literal("move"),
    playerIds: z.array(id).min(1).max(4),
    dest: dropDest,
  }),
  z.object({ type: z.literal("updateSettings"), patch: settingsPatch }),
  z.object({ type: z.literal("endSession") }),
  z.object({ type: z.literal("reopenSession") }),
]);
