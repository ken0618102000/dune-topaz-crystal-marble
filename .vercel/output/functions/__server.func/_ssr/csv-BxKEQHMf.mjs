//#region node_modules/.nitro/vite/services/ssr/assets/csv-BxKEQHMf.js
function splitCsvLine(line) {
	const out = [];
	let cur = "";
	let q = false;
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (q) {
			if (ch === "\"" && line[i + 1] === "\"") {
				cur += "\"";
				i++;
			} else if (ch === "\"") q = false;
			else cur += ch;
		} else if (ch === "\"") q = true;
		else if (ch === ",") {
			out.push(cur.trim());
			cur = "";
		} else cur += ch;
	}
	out.push(cur.trim());
	return out;
}
function parsePlayerCsv(text) {
	const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
	if (lines.length === 0) return [];
	const rows = [];
	const start = /暱稱|nickname|name/i.test(lines[0]) ? 1 : 0;
	for (let i = start; i < lines.length; i++) {
		const cols = splitCsvLine(lines[i]);
		const nickname = (cols[0] ?? "").trim();
		if (!nickname) continue;
		const skillRaw = Number(cols[1] ?? 3);
		const skill = Number.isFinite(skillRaw) ? Math.min(5, Math.max(1, Math.round(skillRaw))) : 3;
		const flag = (cols[2] ?? "").trim();
		const isDropIn = flag === "1" || flag === "true" || flag === "是" || flag === "臨打";
		rows.push({
			nickname,
			skill,
			isDropIn
		});
	}
	return rows;
}
function toCsv(rows) {
	return rows.map((r) => r.map((cell) => {
		if (/[",\n]/.test(cell)) return `"${cell.replaceAll("\"", "\"\"")}"`;
		return cell;
	}).join(",")).join("\n");
}
function downloadCsv(filename, content) {
	const blob = new Blob(["﻿" + content], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}
//#endregion
export { parsePlayerCsv as n, toCsv as r, downloadCsv as t };
