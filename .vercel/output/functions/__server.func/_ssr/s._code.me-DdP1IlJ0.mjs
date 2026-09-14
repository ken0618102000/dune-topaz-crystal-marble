import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as formatWait, n as formatClock, s as remainingMatchMs, t as currentWaitSec } from "./format-cH6pj9B9.mjs";
import { r as Route$1 } from "./router-RHLH_obl.mjs";
import { b as writeSelfId, h as readSelfId, i as STATUS_LABELS, t as Button } from "./types-Cvo8iV_B.mjs";
import { n as useNow, t as useBoard } from "./use-now-CxdYqPIW.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/s._code.me-DdP1IlJ0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function PlayerStatusPage({ code }) {
	const api = useBoard(code);
	const now = useNow(250);
	const stored = readSelfId(code);
	const [picked, setPicked] = (0, import_react.useState)(stored);
	const board = api.board;
	const me = board?.players.find((p) => p.id === picked) ?? null;
	const opponent = (0, import_react.useMemo)(() => {
		if (!board || !me) return null;
		if (me.status === "on_court" || me.status === "queued") return board.players.find((p) => p.id !== me.id && p.courtNo === me.courtNo && p.status === me.status) ?? null;
		return null;
	}, [board, me]);
	if (api.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-dvh items-center justify-center text-muted-foreground",
		children: "載入中…"
	});
	if (!board) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-dvh items-center justify-center p-6",
		children: "找不到場次"
	});
	if (!me) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-3xl",
				children: "羽排"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-xl font-semibold",
				children: "你是誰？"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "選自己的暱稱。此頁只讀，不會改棋盤。"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-2",
				children: board.players.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "secondary",
					className: "justify-between",
					onClick: () => {
						writeSelfId(code, p.id);
						setPicked(p.id);
					},
					children: [p.nickname, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground",
						children: STATUS_LABELS[p.status]
					})]
				}, p.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/s/$code",
					params: { code },
					children: "看完整看板"
				})
			})
		]
	});
	const live = me.status === "on_court" ? board.matches.find((m) => m.status === "live" && m.courtNo === me.courtNo) : void 0;
	const remain = live ? remainingMatchMs(live.startedAt, live.durationMin, live.extendedSec, live.pauseAccumulatedMs, live.pausedAt, now) : null;
	const wait = currentWaitSec(me.lastWaitStart, me.waitTotalSec, now);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs tracking-[0.25em] text-primary",
					children: "YUPAI"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 font-display text-4xl",
					children: me.nickname
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					onClick: () => {
						setPicked(null);
					},
					children: "換人"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "rounded-xl bg-court p-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-line",
						children: STATUS_LABELS[me.status]
					}),
					remain != null ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-6xl tabular leading-none",
						children: formatClock(remain / 1e3)
					}) : me.status === "queued" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-lg",
						children: [
							"等候第 ",
							me.courtNo,
							" 場"
						]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-lg text-muted-foreground",
						children: ["已等 ", formatWait(wait)]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-sm",
						children: opponent ? `對手 ${opponent.nickname}` : "尚無對手"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
				className: "grid grid-cols-2 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "已打",
						value: `${me.playCount} 場`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "輪空",
						value: `${me.byeCount} 次`
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "場號",
						value: me.courtNo ? `第 ${me.courtNo} 場` : "—"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
						label: "鎖定",
						value: me.locked ? "不排" : "可排"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/s/$code",
					params: { code },
					children: "看完整看板"
				})
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-card px-4 py-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-xs text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: "mt-1 text-lg font-medium",
			children: value
		})]
	});
}
function PlayerMe() {
	const { code } = Route$1.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PlayerStatusPage, { code: code.toUpperCase() });
}
//#endregion
export { PlayerMe as component };
