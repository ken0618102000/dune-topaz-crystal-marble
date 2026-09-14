import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/matching-DtfUiZax.js
var matching_exports = /* @__PURE__ */ __exportAll({
	WEIGHT_PRESETS: () => WEIGHT_PRESETS,
	pairKey: () => pairKey,
	pickOpponentForCore: () => pickOpponentForCore,
	pickPairs: () => pickPairs
});
var WEIGHT_PRESETS = {
	fair: {
		wait: 4,
		plays: 4,
		rematch: 3,
		skill: 1
	},
	intensity: {
		wait: 2,
		plays: 1,
		rematch: 2,
		skill: 5
	}
};
function pairKey(a, b) {
	return a < b ? `${a}|${b}` : `${b}|${a}`;
}
function norm(value, xs) {
	if (xs.length === 0) return .5;
	let min = xs[0];
	let max = xs[0];
	for (const x of xs) {
		if (x < min) min = x;
		if (x > max) max = x;
	}
	if (max === min) return .5;
	return (value - min) / (max - min);
}
function consecutiveSame(last, oppId) {
	if (!last || last.length < 2) return false;
	const n = last.length;
	return last[n - 1] === oppId && last[n - 2] === oppId;
}
function justPlayed(last, oppId) {
	if (!last || last.length === 0) return false;
	return last[last.length - 1] === oppId;
}
function compareCore(a, b) {
	if (b.waitMs !== a.waitMs) return b.waitMs - a.waitMs;
	if (a.playCount !== b.playCount) return a.playCount - b.playCount;
	return a.id.localeCompare(b.id);
}
function pickPairs(input) {
	const { slotCount, meetings, lastOpponents, blacklist, weights, banRecent } = input;
	let pool = [...input.candidates];
	const pairs = [];
	const usedPreferredIds = [];
	const take = (id) => {
		pool = pool.filter((p) => p.id !== id);
	};
	for (const pref of input.preferred) {
		if (pairs.length >= slotCount) break;
		const a = pool.find((p) => p.id === pref.a);
		const b = pool.find((p) => p.id === pref.b);
		if (!a || !b) continue;
		if (blacklist.has(pairKey(a.id, b.id))) continue;
		pairs.push({
			a: a.id,
			b: b.id,
			via: "preferred"
		});
		usedPreferredIds.push(pref.id);
		take(a.id);
		take(b.id);
	}
	const scoreOpp = (core, opp, others, hard) => {
		if (blacklist.has(pairKey(core.id, opp.id))) return null;
		const coreLast = lastOpponents.get(core.id);
		const oppLast = lastOpponents.get(opp.id);
		const triple = consecutiveSame(coreLast, opp.id) || consecutiveSame(oppLast, core.id);
		const recent = justPlayed(coreLast, opp.id) || justPlayed(oppLast, core.id);
		if (hard && triple) return null;
		if (hard && banRecent && recent) return null;
		const waits = others.map((p) => p.waitMs);
		const plays = others.map((p) => p.playCount);
		const meetVals = others.map((p) => meetings.get(pairKey(core.id, p.id)) ?? 0);
		const gaps = others.map((p) => Math.abs(core.skill - p.skill));
		let s = weights.wait * norm(opp.waitMs, waits) + weights.plays * (1 - norm(opp.playCount, plays)) + weights.rematch * (1 - norm(meetings.get(pairKey(core.id, opp.id)) ?? 0, meetVals)) + weights.skill * (1 - norm(Math.abs(core.skill - opp.skill), gaps));
		if (triple) s *= .05;
		else if (recent) s *= .3;
		return s;
	};
	const pickOpp = (core, hard) => {
		const others = pool.filter((p) => p.id !== core.id);
		let best = null;
		let bestS = -Infinity;
		for (const opp of others) {
			const s = scoreOpp(core, opp, others, hard);
			if (s == null) continue;
			if (s > bestS || s === bestS && best && opp.id < best.id) {
				bestS = s;
				best = opp;
			}
		}
		return best;
	};
	while (pairs.length < slotCount && pool.length >= 2) {
		pool.sort(compareCore);
		const core = pool[0];
		let opp = pickOpp(core, true);
		if (!opp) opp = pickOpp(core, false);
		if (!opp) {
			pool = pool.filter((p) => p.id !== core.id);
			continue;
		}
		pairs.push({
			a: core.id,
			b: opp.id,
			via: "auto"
		});
		take(core.id);
		take(opp.id);
	}
	const byeId = pool.length === 1 ? pool[0].id : null;
	let failReason = null;
	let warning = null;
	if (pairs.length === 0 && slotCount > 0) failReason = input.candidates.length < 2 ? "人數不足" : "全被硬限制擋下";
	else if (pairs.length < slotCount) warning = input.candidates.length < slotCount * 2 ? "人數不足" : "部分組合被硬限制擋下";
	return {
		pairs,
		byeId,
		usedPreferredIds,
		failReason,
		warning
	};
}
/** Pick a single opponent for a fixed core (e.g. 場上已有 1 人). */
function pickOpponentForCore(coreId, input) {
	const core = input.candidates.find((c) => c.id === coreId);
	if (!core) return null;
	const rest = input.candidates.filter((c) => c.id !== coreId);
	const pair = pickPairs({
		...input,
		preferred: [],
		slotCount: 1,
		candidates: [{
			...core,
			waitMs: core.waitMs + 0xe8d4a51000
		}, ...rest]
	}).pairs[0];
	if (!pair) return null;
	return pair.a === coreId ? pair.b : pair.a;
}
//#endregion
export { pickPairs as a, pickOpponentForCore as i, matching_exports as n, pairKey as r, WEIGHT_PRESETS as t };
