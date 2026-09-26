export function formatClock(totalSec: number): string {
  const sign = totalSec < 0 ? "+" : "";
  const abs = Math.abs(Math.floor(totalSec));
  const m = Math.floor(abs / 60);
  const s = abs % 60;
  return `${sign}${m}:${s.toString().padStart(2, "0")}`;
}

export function formatWait(totalSec: number): string {
  if (totalSec < 60) return `${Math.max(0, Math.floor(totalSec))} 秒`;
  const m = Math.floor(totalSec / 60);
  if (m < 60) return `${m} 分`;
  const h = Math.floor(m / 60);
  return `${h} 時 ${m % 60} 分`;
}

export function formatMinutes(totalSec: number): string {
  return `${Math.round(totalSec / 60)} 分`;
}

export function stintWaitSec(lastWaitStart: string | null, now: number): number {
  if (!lastWaitStart) return 0;
  return Math.max(0, (now - Date.parse(lastWaitStart)) / 1000);
}

export function currentWaitSec(
  lastWaitStart: string | null,
  waitTotalSec: number,
  now: number,
): number {
  const extra = lastWaitStart
    ? Math.max(0, (now - Date.parse(lastWaitStart)) / 1000)
    : 0;
  return waitTotalSec + extra;
}

export function elapsedMatchMs(
  startedAt: string | null,
  pauseAccumulatedMs: number,
  pausedAt: string | null,
  now: number,
): number {
  if (!startedAt) return 0;
  const started = Date.parse(startedAt);
  const pausedNow = pausedAt ? Math.max(0, now - Date.parse(pausedAt)) : 0;
  return Math.max(0, now - started - pauseAccumulatedMs - pausedNow);
}

export function matchBudgetMs(durationMin: number, extendedSec: number): number {
  return durationMin * 60_000 + extendedSec * 1000;
}

export function remainingMatchMs(
  startedAt: string | null,
  durationMin: number,
  extendedSec: number,
  pauseAccumulatedMs: number,
  pausedAt: string | null,
  now: number,
): number {
  return (
    matchBudgetMs(durationMin, extendedSec) -
    elapsedMatchMs(startedAt, pauseAccumulatedMs, pausedAt, now)
  );
}

export function todayISO(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDateLabel(isoDate: string): string {
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${Number(m)} 月 ${Number(d)} 日`;
}
