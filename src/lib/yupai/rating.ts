import { clampSkill, formatSkill, formatSkillDelta } from "./types.ts";

/** 4 級差 ≈ 九成勝率（10^(4/4)=10 → expected ≈ 0.91） */
export const RATING_SCALE = 4;
/** 一場最多移動約半級；爆冷會接近這個上限。 */
export const RATING_K = 0.55;

export function expectedScore(skillA: number, skillB: number): number {
  return 1 / (1 + 10 ** ((skillB - skillA) / RATING_SCALE));
}

export function actualFromResult(opts: {
  scoreA?: number | null;
  scoreB?: number | null;
  winner?: "a" | "b" | null;
}): number | null {
  const a = opts.scoreA;
  const b = opts.scoreB;
  const hasScores =
    a != null &&
    b != null &&
    Number.isFinite(a) &&
    Number.isFinite(b) &&
    a >= 0 &&
    b >= 0 &&
    a + b > 0;
  if (hasScores) return a! / (a! + b!);
  if (opts.winner === "a") return 1;
  if (opts.winner === "b") return 0;
  return null;
}

export type RatingUpdate = {
  skillA: number;
  skillB: number;
  deltaA: number;
  deltaB: number;
  actualA: number;
  expectedA: number;
};

export function applyMatchRating(input: {
  skillA: number;
  skillB: number;
  scoreA?: number | null;
  scoreB?: number | null;
  winner?: "a" | "b" | null;
}): RatingUpdate | null {
  const actualA = actualFromResult(input);
  if (actualA == null) return null;
  const expectedA = expectedScore(input.skillA, input.skillB);
  const deltaA = RATING_K * (actualA - expectedA);
  const deltaB = -deltaA;
  return {
    skillA: clampSkill(input.skillA + deltaA),
    skillB: clampSkill(input.skillB + deltaB),
    deltaA: Math.round(deltaA * 10) / 10,
    deltaB: Math.round(deltaB * 10) / 10,
    actualA,
    expectedA,
  };
}

export function ratingSummary(
  nameA: string,
  nameB: string,
  update: RatingUpdate,
): string {
  return `${nameA} ${formatSkill(update.skillA)}（${formatSkillDelta(update.deltaA)}） · ${nameB} ${formatSkill(update.skillB)}（${formatSkillDelta(update.deltaB)}）`;
}
