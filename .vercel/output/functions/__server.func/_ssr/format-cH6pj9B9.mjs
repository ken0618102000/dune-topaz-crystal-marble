import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/format-cH6pj9B9.js
var format_exports = /* @__PURE__ */ __exportAll({
	currentWaitSec: () => currentWaitSec,
	formatClock: () => formatClock,
	formatDateLabel: () => formatDateLabel,
	formatMinutes: () => formatMinutes,
	formatWait: () => formatWait,
	remainingMatchMs: () => remainingMatchMs,
	todayISO: () => todayISO
});
function formatClock(totalSec) {
	const sign = totalSec < 0 ? "+" : "";
	const abs = Math.abs(Math.floor(totalSec));
	return `${sign}${Math.floor(abs / 60)}:${(abs % 60).toString().padStart(2, "0")}`;
}
function formatWait(totalSec) {
	if (totalSec < 60) return `${Math.max(0, Math.floor(totalSec))} 秒`;
	const m = Math.floor(totalSec / 60);
	if (m < 60) return `${m} 分`;
	return `${Math.floor(m / 60)} 時 ${m % 60} 分`;
}
function formatMinutes(totalSec) {
	return `${Math.round(totalSec / 60)} 分`;
}
function currentWaitSec(lastWaitStart, waitTotalSec, now) {
	return waitTotalSec + (lastWaitStart ? Math.max(0, (now - Date.parse(lastWaitStart)) / 1e3) : 0);
}
function remainingMatchMs(startedAt, durationMin, extendedSec, pauseAccumulatedMs, pausedAt, now) {
	if (!startedAt) return durationMin * 6e4;
	const started = Date.parse(startedAt);
	const pausedNow = pausedAt ? Math.max(0, now - Date.parse(pausedAt)) : 0;
	const elapsed = now - started - pauseAccumulatedMs - pausedNow;
	return durationMin * 6e4 + extendedSec * 1e3 - elapsed;
}
function todayISO(d = /* @__PURE__ */ new Date()) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function formatDateLabel(isoDate) {
	const [y, m, d] = isoDate.split("-");
	if (!y || !m || !d) return isoDate;
	return `${Number(m)} 月 ${Number(d)} 日`;
}
//#endregion
export { formatWait as a, todayISO as c, formatMinutes as i, formatClock as n, format_exports as o, formatDateLabel as r, remainingMatchMs as s, currentWaitSec as t };
