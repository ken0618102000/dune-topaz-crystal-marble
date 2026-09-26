export const PLAYER_STATUSES = [
  "not_arrived",
  "rest",
  "queued",
  "on_court",
  "force_rest",
  "left",
] as const;

export type PlayerStatus = (typeof PLAYER_STATUSES)[number];

export const SKILL_MIN = 1;
export const SKILL_MAX = 18;
export const SKILL_DEFAULT = 10;

/** @deprecated use skillBand(); kept so old 1–5 indexes still render something */
export const SKILL_LABELS = ["", "初學", "入門", "中等", "進階", "高手"] as const;

export const SKILL_BANDS: Array<{ max: number; label: string }> = [
  { max: 3, label: "初學" },
  { max: 6, label: "入門" },
  { max: 9, label: "中下" },
  { max: 12, label: "中等" },
  { max: 15, label: "中上" },
  { max: 18, label: "高手" },
];

export function clampSkill(n: number): number {
  if (!Number.isFinite(n)) return SKILL_DEFAULT;
  const rounded = Math.round(n * 10) / 10;
  return Math.min(SKILL_MAX, Math.max(SKILL_MIN, rounded));
}

export function skillBand(skill: number): string {
  const s = Math.round(clampSkill(skill));
  for (const band of SKILL_BANDS) {
    if (s <= band.max) return band.label;
  }
  return "高手";
}

export function formatSkill(skill: number): string {
  const n = clampSkill(skill);
  const shown = Number.isInteger(n) ? String(n) : n.toFixed(1);
  return `${shown}級`;
}

export function formatSkillDelta(delta: number): string {
  if (!Number.isFinite(delta) || Math.abs(delta) < 0.05) return "0";
  const abs = Math.abs(delta).toFixed(1);
  return delta > 0 ? `+${abs}` : `−${abs}`;
}

/** Map leftover 1–5 values (old UI) onto the 1–18 scale. */
export function migrateLegacySkill(skill: number): number {
  if (!Number.isFinite(skill)) return SKILL_DEFAULT;
  if (skill > 5) return clampSkill(skill);
  const map = [SKILL_DEFAULT, 3, 6, 10, 14, 17] as const;
  return map[Math.round(skill)] ?? SKILL_DEFAULT;
}

export const STATUS_LABELS: Record<PlayerStatus, string> = {
  not_arrived: "未到",
  rest: "休息",
  queued: "排隊中",
  on_court: "場上",
  force_rest: "強制休息",
  left: "離場",
};

export const MATCH_DURATIONS = [8, 10, 12, 15] as const;

export type WeightPreset = "fair" | "intensity" | "custom";

export type Weights = {
  wait: number;
  plays: number;
  rematch: number;
  skill: number;
};

export type Session = {
  id: string;
  code: string;
  venueName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  courtCount: number;
  matchDurationMin: number;
  consecutiveLimit: number;
  forceRestAfterMatch: boolean;
  banRecentOpponent: boolean;
  scoringEnabled: boolean;
  weights: Weights;
  weightPreset: WeightPreset;
  status: "active" | "ended";
  controllerDeviceId: string | null;
  transferPin: string | null;
  transferPinExpiresAt: string | null;
  version: number;
};

export type Player = {
  id: string;
  nickname: string;
  skill: number;
  seedSkill: number;
  isDropIn: boolean;
  status: PlayerStatus;
  locked: boolean;
  courtNo: number | null;
  consecutivePlayed: number;
  playCount: number;
  byeCount: number;
  waitTotalSec: number;
  playTotalSec: number;
  lastWaitStart: string | null;
  lastOpponentId: string | null;
  sortOrder: number;
};

export type Restriction = {
  id: string;
  kind: "blacklist" | "preferred";
  playerAId: string;
  playerBId: string;
  used: boolean;
};

export type Match = {
  id: string;
  courtNo: number;
  playerAId: string;
  playerBId: string;
  startedAt: string | null;
  endedAt: string | null;
  source: "auto" | "manual";
  status: "live" | "completed" | "cancelled";
  winnerId: string | null;
  scoreA: number | null;
  scoreB: number | null;
  durationMin: number;
  extendedSec: number;
  pauseAccumulatedMs: number;
  pausedAt: string | null;
};

export type BoardState = {
  session: Session;
  players: Player[];
  restrictions: Restriction[];
  matches: Match[];
};

export type DropDest =
  | { zone: "rest" }
  | { zone: "court"; courtNo: number; replacePlayerId?: string }
  | { zone: "queue"; courtNo: number; replacePlayerId?: string };

export type BoardAction =
  | {
      type: "addPlayer";
      nickname: string;
      skill: number;
      isDropIn?: boolean;
    }
  | { type: "renamePlayer"; playerId: string; nickname: string }
  | { type: "removePlayer"; playerId: string }
  | { type: "setStatus"; playerId: string; status: PlayerStatus }
  | { type: "setLocked"; playerId: string; locked: boolean }
  | { type: "setSkill"; playerId: string; skill: number }
  | {
      type: "importPlayers";
      rows: Array<{ nickname: string; skill: number; isDropIn: boolean }>;
    }
  | {
      type: "addRestriction";
      kind: "blacklist" | "preferred";
      playerAId: string;
      playerBId: string;
    }
  | { type: "removeRestriction"; id: string }
  | { type: "checkInAll" }
  | { type: "fillNext" }
  | { type: "stageQueue" }
  | { type: "promoteQueue" }
  | { type: "reshuffleNext" }
  | {
      type: "endMatch";
      courtNo: number;
      winnerId?: string | null;
      scoreA?: number | null;
      scoreB?: number | null;
    }
  | { type: "pauseMatch"; courtNo: number }
  | { type: "resumeMatch"; courtNo: number }
  | { type: "extendMatch"; courtNo: number; extraSec: number }
  | { type: "move"; playerIds: string[]; dest: DropDest }
  | { type: "updateSettings"; patch: Partial<SessionSettingsPatch> }
  | { type: "endSession" }
  | { type: "reopenSession" };

export type SessionSettingsPatch = {
  venueName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  courtCount: number;
  matchDurationMin: number;
  consecutiveLimit: number;
  forceRestAfterMatch: boolean;
  banRecentOpponent: boolean;
  scoringEnabled: boolean;
  weights: Weights;
  weightPreset: WeightPreset;
};

export type ActionResult = {
  state: BoardState;
  message?: string;
  warning?: string;
};

export type EngineError = {
  error: string;
};

export function isEngineError(x: ActionResult | EngineError): x is EngineError {
  return "error" in x;
}

export type PlayerPublic = Player;

export type BoardPayload = {
  session: Session;
  players: Player[];
  restrictions: Restriction[];
  matches: Match[];
  version: number;
  canUndo: boolean;
  isHost: boolean;
  isController: boolean;
  youAreHost: boolean;
  message?: string;
  warning?: string;
  conflict?: boolean;
};

export type CreateSessionInput = {
  venueName: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  courtCount: number;
  matchDurationMin: number;
  consecutiveLimit: number;
  forceRestAfterMatch: boolean;
  banRecentOpponent: boolean;
  scoringEnabled: boolean;
  weights: Weights;
  weightPreset: WeightPreset;
  deviceId: string;
};
