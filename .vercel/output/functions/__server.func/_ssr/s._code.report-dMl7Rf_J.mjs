import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as formatWait, i as formatMinutes, t as currentWaitSec } from "./format-cH6pj9B9.mjs";
import { n as Route } from "./router-RHLH_obl.mjs";
import { r as SKILL_LABELS, t as Button } from "./types-Cvo8iV_B.mjs";
import { n as useNow, t as useBoard } from "./use-now-CxdYqPIW.mjs";
import { r as toCsv, t as downloadCsv } from "./csv-BxKEQHMf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/s._code.report-dMl7Rf_J.js
var import_jsx_runtime = require_jsx_runtime();
function ReportPage({ code }) {
	const api = useBoard(code);
	const now = useNow(1e3);
	const board = api.board;
	if (api.isLoading || !board) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-dvh items-center justify-center text-muted-foreground",
		children: "報表載入中…"
	});
	const completed = board.matches.filter((m) => m.status === "completed");
	const active = board.players.filter((p) => p.status !== "not_arrived");
	const plays = active.map((p) => p.playCount);
	const playGap = plays.length ? Math.max(...plays) - Math.min(...plays) : 0;
	const waits = active.map((p) => currentWaitSec(p.lastWaitStart, p.waitTotalSec, now));
	const longestWait = waits.length ? Math.max(...waits) : 0;
	const opponentNames = (id) => {
		const names = /* @__PURE__ */ new Set();
		for (const m of completed) {
			if (m.playerAId === id) {
				const n = board.players.find((p) => p.id === m.playerBId)?.nickname;
				if (n) names.add(n);
			}
			if (m.playerBId === id) {
				const n = board.players.find((p) => p.id === m.playerAId)?.nickname;
				if (n) names.add(n);
			}
		}
		return [...names];
	};
	const exportCsv = () => {
		const playerRows = [[
			"暱稱",
			"程度",
			"上場次數",
			"總打分鐘",
			"等待分鐘",
			"輪空",
			"對手"
		], ...board.players.map((p) => [
			p.nickname,
			SKILL_LABELS[p.skill] ?? String(p.skill),
			String(p.playCount),
			String(Math.round(p.playTotalSec / 60)),
			String(Math.round(currentWaitSec(p.lastWaitStart, p.waitTotalSec, now) / 60)),
			String(p.byeCount),
			opponentNames(p.id).join(" / ")
		])];
		const matchRows = [
			[],
			[
				"場號",
				"球員A",
				"球員B",
				"開始",
				"結束",
				"來源",
				"勝方"
			],
			...completed.map((m) => [
				String(m.courtNo),
				board.players.find((p) => p.id === m.playerAId)?.nickname ?? "",
				board.players.find((p) => p.id === m.playerBId)?.nickname ?? "",
				m.startedAt ?? "",
				m.endedAt ?? "",
				m.source === "auto" ? "自動" : "手動",
				m.winnerId ? board.players.find((p) => p.id === m.winnerId)?.nickname ?? "" : ""
			])
		];
		downloadCsv(`yupai-${board.session.code}.csv`, toCsv([...playerRows, ...matchRows]));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh max-w-4xl flex-col gap-6 px-5 py-8",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-2xl",
					children: "當日報表"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						board.session.venueName,
						" · ",
						board.session.code
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "ml-auto flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: exportCsv,
						children: "匯出 CSV"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/s/$code",
							params: { code },
							children: "回看板"
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "grid grid-cols-2 gap-3 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						label: "上場次數差",
						value: String(playGap),
						hint: "愈小愈公平"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						label: "最長等待",
						value: formatWait(longestWait)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						label: "完成場次",
						value: String(completed.length)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tile, {
						label: "球員",
						value: String(board.players.length)
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto rounded-xl border border-border",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-secondary text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "暱稱"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "上場"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "打過"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "等待"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "輪空"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-3 py-2 font-medium",
								children: "對手"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: board.players.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-border",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2",
								children: p.nickname
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "tabular px-3 py-2",
								children: p.playCount
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "tabular px-3 py-2",
								children: formatMinutes(p.playTotalSec)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "tabular px-3 py-2",
								children: formatWait(currentWaitSec(p.lastWaitStart, p.waitTotalSec, now))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "tabular px-3 py-2",
								children: p.byeCount
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-3 py-2 text-muted-foreground",
								children: opponentNames(p.id).join("、") || "—"
							})
						]
					}, p.id)) })]
				})
			})
		]
	});
}
function Tile({ label, value, hint }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-card px-4 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-display text-2xl tabular",
				children: value
			}),
			hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: hint
			}) : null
		]
	});
}
function SessionReport() {
	const { code } = Route.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReportPage, { code: code.toUpperCase() });
}
//#endregion
export { SessionReport as component };
