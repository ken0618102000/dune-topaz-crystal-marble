export const PLAYER_STATUSES = [
  "not_arrived",
  "rest",
  "queued",
  "on_court",
  "force_rest",
  "left",
] as const;

export type PlayerStatus = (typeof PLAYER_STATUSES)[number];

export const SKILL_LABELS = ["", "初學", "入門", "中等", "進階", "高手"] as const;

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
