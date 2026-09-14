import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { a as formatWait, n as formatClock, r as formatDateLabel, s as remainingMatchMs, t as currentWaitSec } from "./format-cH6pj9B9.mjs";
import { t as WEIGHT_PRESETS } from "./matching-DtfUiZax.mjs";
import { a as Square, c as Shuffle, d as Plus, f as Play, g as ChartColumn, h as ClipboardCopy, l as Settings, m as Lock, n as Users, o as Sparkles, p as Pause, r as UserRound, s as Smartphone, t as X, u as RotateCcw } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Route$2 } from "./router-RHLH_obl.mjs";
import { g as rememberPlayers, i as STATUS_LABELS, m as readHostToken, n as MATCH_DURATIONS, p as readFrequent, r as SKILL_LABELS, s as cn, t as Button } from "./types-Cvo8iV_B.mjs";
import { n as Label, r as Switch, t as Input } from "./switch-ySLdcKGy.mjs";
import { n as useNow, t as useBoard } from "./use-now-CxdYqPIW.mjs";
import { n as parsePlayerCsv } from "./csv-BxKEQHMf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/s._code-DITB-OpP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
function DialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
		className: cn("fixed inset-0 z-50 bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
		...props
	});
}
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 grid w-[min(100%-2rem,32rem)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-lg", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 right-3 rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "關閉"
			})]
		})]
	})] });
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1.5", className),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("text-lg font-semibold leading-snug", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
function DialogFooter({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
		...props
	});
}
var Sheet = Dialog$1;
var SheetPortal = DialogPortal$1;
function SheetOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
		className: cn("fixed inset-0 z-50 bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
		...props
	});
}
function SheetContent({ className, children, side = "right", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed z-50 flex flex-col gap-4 bg-card text-card-foreground shadow-lg transition duration-200", "data-[state=open]:animate-in data-[state=closed]:animate-out", side === "right" && "inset-y-0 right-0 h-full w-[min(100%,28rem)] border-l border-border data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right", side === "left" && "inset-y-0 left-0 h-full w-[min(100%,28rem)] border-r border-border data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left", side === "bottom" && "inset-x-0 bottom-0 max-h-[85vh] rounded-t-xl border-t border-border p-0 data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 right-3 rounded-md p-2 text-muted-foreground hover:bg-secondary",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "關閉"
			})]
		})]
	})] });
}
function SheetHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex flex-col gap-1 p-6 pb-0", className),
		...props
	});
}
function SheetTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("text-lg font-semibold", className),
		...props
	});
}
function SheetDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
function Nameplate({ player, now, lastOpponentName, dim, onPointerDown }) {
	const waiting = player.status === "rest" || player.status === "force_rest" ? currentWaitSec(player.lastWaitStart, player.waitTotalSec, now) : 0;
	const meta = [];
	if (player.status === "rest" || player.status === "force_rest") meta.push(formatWait(waiting));
	meta.push(`${player.playCount} 場`);
	if (lastOpponentName) meta.push(`上 ${lastOpponentName}`);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		"data-player-id": player.id,
		className: cn("nameplate flex min-h-12 min-w-28 flex-col items-start justify-center rounded-lg bg-secondary px-3 py-2 text-left", "border border-transparent transition-colors duration-150", "hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring", player.status === "force_rest" && "opacity-80", player.locked && "border-warn/40", dim && "opacity-50"),
		onPointerDown,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "flex w-full items-center gap-1.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate text-base font-medium leading-tight",
					children: player.nickname
				}),
				player.locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3.5 shrink-0 text-warn" }) : null,
				player.isDropIn ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-accent px-1.5 text-[10px] tracking-wide text-muted-foreground",
					children: "臨"
				}) : null,
				player.status === "force_rest" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded-full bg-warn/20 px-1.5 text-[10px] text-warn",
					children: STATUS_LABELS.force_rest
				}) : null
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SkillDots, { skill: player.skill }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: SKILL_LABELS[player.skill] }),
				meta.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["· ", meta.join(" · ")] }) : null
			]
		})]
	});
}
function SkillDots({ skill }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex items-center gap-0.5",
		"aria-hidden": true,
		children: Array.from({ length: 5 }, (_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("size-1 rounded-full", i < skill ? "bg-primary" : "bg-border") }, i))
	});
}
function EmptySeat({ label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-12 min-w-28 items-center justify-center rounded-lg border border-dashed border-border bg-background/40 px-3 text-sm text-muted-foreground",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, { className: "mr-1.5 size-3.5" }), label]
	});
}
function CourtCard({ courtNo, players, match, now, nameOf, canEdit, onEnd, onPause, onResume, onExtend, onPointerPlayer }) {
	const remaining = match ? remainingMatchMs(match.startedAt, match.durationMin, match.extendedSec, match.pauseAccumulatedMs, match.pausedAt, now) : null;
	const overtime = remaining != null && remaining <= 0 && players.length === 2;
	const paused = Boolean(match?.pausedAt);
	const a = players[0];
	const b = players[1];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-drop": `court:${courtNo}`,
		className: cn("flex min-w-56 flex-col rounded-xl bg-court p-3", overtime && "court-overtime"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "mb-2 flex items-center justify-between gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
					className: "text-sm font-medium tracking-wide text-line",
					children: [
						"第 ",
						courtNo,
						" 場"
					]
				}), remaining != null && players.length === 2 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: cn("font-display tabular text-2xl leading-none tracking-tight", overtime ? "text-warn" : "text-foreground"),
					children: [formatClock(remaining / 1e3), paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-2 text-xs font-sans text-muted-foreground",
						children: "暫停"
					}) : null]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: players.length === 1 ? "人數不足" : "空場"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-drop": a ? `seat:court:${courtNo}:${a.id}` : `court:${courtNo}`,
						children: a ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nameplate, {
							player: a,
							now,
							lastOpponentName: a.lastOpponentId ? nameOf(a.lastOpponentId) : null,
							onPointerDown: (e) => onPointerPlayer(a, e)
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptySeat, { label: "空位" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-center text-xs tracking-[0.3em] text-line/70",
						children: "VS"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						"data-drop": b ? `seat:court:${courtNo}:${b.id}` : `court:${courtNo}`,
						children: b ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nameplate, {
							player: b,
							now,
							lastOpponentName: b.lastOpponentId ? nameOf(b.lastOpponentId) : null,
							onPointerDown: (e) => onPointerPlayer(b, e)
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptySeat, { label: "空位" })
					})
				]
			}),
			canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "flex-1",
						disabled: players.length !== 2,
						onClick: onEnd,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-3.5" }), "下場"]
					}),
					match && !paused ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
						variant: "secondary",
						onClick: onPause,
						"aria-label": "暫停",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" })
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
						variant: "secondary",
						onClick: onResume,
						disabled: !match,
						"aria-label": "繼續",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
						variant: "secondary",
						onClick: onExtend,
						disabled: !match,
						"aria-label": "延長兩分鐘",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" })
					})
				]
			}) : null
		]
	});
}
function NextSlot({ courtNo, players, now, nameOf, onPointerPlayer, onPointerPair }) {
	const a = players[0];
	const b = players[1];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-drop": `queue:${courtNo}`,
		"data-pair-ids": players.map((p) => p.id).join(","),
		onPointerDown: players.length === 2 ? onPointerPair : void 0,
		className: "flex min-w-56 flex-col gap-2 rounded-xl border border-border bg-card p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs font-medium tracking-wide text-muted-foreground",
				children: ["下一場 · ", courtNo]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-2",
				"data-drop": a ? `seat:queue:${courtNo}:${a.id}` : `queue:${courtNo}`,
				children: a ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nameplate, {
					player: a,
					now,
					lastOpponentName: a.lastOpponentId ? nameOf(a.lastOpponentId) : null,
					onPointerDown: (e) => {
						e.stopPropagation();
						onPointerPlayer(a, e);
					}
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptySeat, { label: "等待" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-[10px] tracking-[0.3em] text-muted-foreground",
				children: "VS"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-2",
				"data-drop": b ? `seat:queue:${courtNo}:${b.id}` : `queue:${courtNo}`,
				children: b ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nameplate, {
					player: b,
					now,
					lastOpponentName: b.lastOpponentId ? nameOf(b.lastOpponentId) : null,
					onPointerDown: (e) => {
						e.stopPropagation();
						onPointerPlayer(b, e);
					}
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptySeat, { label: "等待" })
			})
		]
	});
}
function RosterSheet({ open, onOpenChange, api, players }) {
	const [name, setName] = (0, import_react.useState)("");
	const [skill, setSkill] = (0, import_react.useState)(3);
	const [dropIn, setDropIn] = (0, import_react.useState)(false);
	const [csv, setCsv] = (0, import_react.useState)("");
	const frequent = readFrequent();
	const canEdit = api.canEdit;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			className: "overflow-y-auto p-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "當日名單" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, { children: "暱稱不可重複。臨打不會寫入常用名單。" })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-6 p-6",
				children: [
					canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "flex flex-col gap-3 rounded-lg bg-secondary p-4",
						onSubmit: (e) => {
							e.preventDefault();
							if (!name.trim()) return;
							api.run({
								type: "addPlayer",
								nickname: name,
								skill,
								isDropIn: dropIn
							});
							setName("");
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "new-nick",
								children: "新增球員"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "new-nick",
								value: name,
								onChange: (e) => setName(e.target.value),
								placeholder: "暱稱",
								maxLength: 16
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["程度 ", SKILL_LABELS[skill]] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: 1,
									max: 5,
									value: skill,
									onChange: (e) => setSkill(Number(e.target.value)),
									className: "w-36 accent-primary"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center justify-between gap-3 text-sm",
								children: ["臨打", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: dropIn,
									onCheckedChange: setDropIn
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "加入"
							}),
							frequent.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mb-2 text-xs text-muted-foreground",
								children: "常用名單"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: frequent.filter((f) => !players.some((p) => p.nickname === f.nickname)).map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "rounded-full bg-accent px-3 py-1.5 text-sm",
									onClick: () => api.run({
										type: "addPlayer",
										nickname: f.nickname,
										skill: f.skill,
										isDropIn: false
									}),
									children: f.nickname
								}, f.nickname))
							})] }) : null
						]
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2",
						children: [
							canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => api.run({ type: "checkInAll" }),
								children: "全部簽到"
							}) : null,
							players.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-2 rounded-lg bg-secondary px-3 py-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-medium",
									children: p.nickname
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-xs text-muted-foreground",
									children: [
										STATUS_LABELS[p.status],
										" · ",
										SKILL_LABELS[p.skill],
										" · ",
										p.playCount,
										" 場",
										p.isDropIn ? " · 臨打" : ""
									]
								})] }), canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-1",
									children: [p.status === "not_arrived" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "secondary",
										onClick: () => api.run({
											type: "setStatus",
											playerId: p.id,
											status: "rest"
										}),
										children: "簽到"
									}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										size: "sm",
										variant: "ghost",
										onClick: () => api.run({
											type: "removePlayer",
											playerId: p.id
										}),
										children: "刪"
									})]
								}) : null]
							}, p.id)),
							players.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "還沒有球員。"
							}) : null
						]
					}),
					canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "csv",
								children: "CSV 匯入（暱稱,程度,臨打）"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								id: "csv",
								value: csv,
								onChange: (e) => setCsv(e.target.value),
								rows: 5,
								className: "w-full rounded-md border border-input bg-secondary p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
								placeholder: "暱稱,程度,臨打\n阿明,3,0\n小美,4,1"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => {
									const rows = parsePlayerCsv(csv);
									if (!rows.length) return;
									api.run({
										type: "importPlayers",
										rows
									});
									setCsv("");
								},
								children: "匯入"
							})
						]
					}) : null
				]
			})]
		})
	});
}
function SettingsSheet({ open, onOpenChange, api, session }) {
	const [venueName, setVenueName] = (0, import_react.useState)(session.venueName);
	const [startTime, setStartTime] = (0, import_react.useState)(session.startTime);
	const [endTime, setEndTime] = (0, import_react.useState)(session.endTime);
	const [courtCount, setCourtCount] = (0, import_react.useState)(session.courtCount);
	const [duration, setDuration] = (0, import_react.useState)(session.matchDurationMin);
	const [consecutive, setConsecutive] = (0, import_react.useState)(session.consecutiveLimit);
	const [forceRest, setForceRest] = (0, import_react.useState)(session.forceRestAfterMatch);
	const [banRecent, setBanRecent] = (0, import_react.useState)(session.banRecentOpponent);
	const [scoring, setScoring] = (0, import_react.useState)(session.scoringEnabled);
	const [weights, setWeights] = (0, import_react.useState)(session.weights);
	const [preset, setPreset] = (0, import_react.useState)(session.weightPreset);
	const [hostKey, setHostKey] = (0, import_react.useState)("");
	const [pin, setPin] = (0, import_react.useState)("");
	const token = readHostToken(session.code);
	(0, import_react.useEffect)(() => {
		setVenueName(session.venueName);
		setStartTime(session.startTime);
		setEndTime(session.endTime);
		setCourtCount(session.courtCount);
		setDuration(session.matchDurationMin);
		setConsecutive(session.consecutiveLimit);
		setForceRest(session.forceRestAfterMatch);
		setBanRecent(session.banRecentOpponent);
		setScoring(session.scoringEnabled);
		setWeights(session.weights);
		setPreset(session.weightPreset);
	}, [session]);
	const applyPreset = (key) => {
		setPreset(key);
		setWeights({ ...WEIGHT_PRESETS[key] });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			className: "overflow-y-auto p-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: "場次設定" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetDescription, { children: ["場次碼 ", session.code] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-5 p-6",
				children: [api.canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "場館",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: venueName,
							onChange: (e) => setVenueName(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "開始",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "time",
								value: startTime,
								onChange: (e) => setStartTime(e.target.value)
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "結束",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "time",
								value: endTime,
								onChange: (e) => setEndTime(e.target.value)
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: `面數 ${courtCount}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 1,
							max: 6,
							value: courtCount,
							onChange: (e) => setCourtCount(Number(e.target.value)),
							className: "w-full accent-primary"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "每場時長" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex gap-2",
						children: MATCH_DURATIONS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							size: "sm",
							variant: duration === m ? "default" : "secondary",
							onClick: () => setDuration(m),
							children: [m, " 分"]
						}, m))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: `連續打滿 ${consecutive} 場必須休息`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 1,
							max: 4,
							value: consecutive,
							onChange: (e) => setConsecutive(Number(e.target.value)),
							className: "w-full accent-primary"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "下場後強制休息 1 輪",
						checked: forceRest,
						onCheckedChange: setForceRest
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "剛互打完本輪禁止再遇",
						checked: banRecent,
						onCheckedChange: setBanRecent
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toggle, {
						label: "記下勝負 / 比分",
						checked: scoring,
						onCheckedChange: setScoring
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "配對權重" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: preset === "fair" ? "default" : "secondary",
								onClick: () => applyPreset("fair"),
								children: "公平優先"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								variant: preset === "intensity" ? "default" : "secondary",
								onClick: () => applyPreset("intensity"),
								children: "強度優先"
							})]
						}),
						[
							["wait", "等待"],
							["plays", "上場次數"],
							["rematch", "對手重複"],
							["skill", "程度差"]
						].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: `${label} ${weights[key]}`,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "range",
								min: 0,
								max: 8,
								value: weights[key],
								onChange: (e) => {
									setPreset("custom");
									setWeights({
										...weights,
										[key]: Number(e.target.value)
									});
								},
								className: "w-full accent-primary"
							})
						}, key))
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => api.run({
							type: "updateSettings",
							patch: {
								venueName,
								sessionDate: session.sessionDate,
								startTime,
								endTime,
								courtCount,
								matchDurationMin: duration,
								consecutiveLimit: consecutive,
								forceRestAfterMatch: forceRest,
								banRecentOpponent: banRecent,
								scoringEnabled: scoring,
								weights,
								weightPreset: preset
							}
						}),
						children: "儲存設定"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: () => api.run({ type: "endSession" }),
						children: "結束場次"
					})
				] }) : session.status === "ended" && api.board?.isHost ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => api.run({ type: "reopenSession" }),
					children: "重開當日看板"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "目前為只讀，取得主控後可改設定。"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-border p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-medium",
							children: "主控"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: "同一場次只有一台裝置能改棋盤。球友用場次碼只看自己的狀態。"
						}),
						api.board?.isController ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-3",
							variant: "secondary",
							onClick: async () => {
								const res = await api.startTransfer.mutateAsync();
								if ("pin" in res) setPin(res.pin);
								else setPin("");
							},
							children: "產生移交碼"
						}) : null,
						pin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-3xl tracking-widest",
							children: pin
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-3 flex flex-col gap-2",
							onSubmit: (e) => {
								e.preventDefault();
								if (hostKey.trim()) api.claim.mutate(hostKey.trim());
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "host-key",
									children: "主控密鑰"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "host-key",
									value: hostKey,
									onChange: (e) => setHostKey(e.target.value),
									placeholder: token ? "已儲存在此裝置" : "貼上主控密鑰"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									variant: "secondary",
									children: "取得主控"
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-3 flex flex-col gap-2",
							onSubmit: (e) => {
								e.preventDefault();
								api.acceptTransfer.mutate(pinInputValue(e));
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "xfer",
									children: "移交碼"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "xfer",
									name: "pin",
									placeholder: "四位數字",
									maxLength: 4
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									variant: "outline",
									children: "用移交碼接下主控"
								})
							]
						}),
						token ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-3 break-all text-xs text-muted-foreground",
							children: ["此裝置密鑰：", token]
						}) : null
					]
				})]
			})]
		})
	});
}
function pinInputValue(e) {
	const fd = new FormData(e.currentTarget);
	return String(fd.get("pin") ?? "");
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), children]
	});
}
function Toggle({ label, checked, onCheckedChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "flex items-center justify-between gap-3 text-sm",
		children: [label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked,
			onCheckedChange
		})]
	});
}
function parseDrop(raw) {
	if (!raw) return null;
	if (raw === "rest") return { zone: "rest" };
	const court = /^court:(\d+)$/.exec(raw);
	if (court) return {
		zone: "court",
		courtNo: Number(court[1])
	};
	const queue = /^queue:(\d+)$/.exec(raw);
	if (queue) return {
		zone: "queue",
		courtNo: Number(queue[1])
	};
	const seatC = /^seat:court:(\d+):(.+)$/.exec(raw);
	if (seatC) return {
		zone: "court",
		courtNo: Number(seatC[1]),
		replacePlayerId: seatC[2]
	};
	const seatQ = /^seat:queue:(\d+):(.+)$/.exec(raw);
	if (seatQ) return {
		zone: "queue",
		courtNo: Number(seatQ[1]),
		replacePlayerId: seatQ[2]
	};
	return null;
}
function dropFromPoint(x, y) {
	const node = document.elementFromPoint(x, y)?.closest("[data-drop]");
	return parseDrop(node?.dataset.drop ?? null);
}
function BoardView({ code }) {
	const api = useBoard(code);
	const now = useNow(250);
	const board = api.board;
	const [rosterOpen, setRosterOpen] = (0, import_react.useState)(false);
	const [settingsOpen, setSettingsOpen] = (0, import_react.useState)(false);
	const [menuPlayer, setMenuPlayer] = (0, import_react.useState)(null);
	const [pickMode, setPickMode] = (0, import_react.useState)(null);
	const [scoreCourt, setScoreCourt] = (0, import_react.useState)(null);
	const [drag, setDrag] = (0, import_react.useState)(null);
	const longPress = (0, import_react.useRef)(null);
	const dragging = (0, import_react.useRef)(false);
	const startPt = (0, import_react.useRef)({
		x: 0,
		y: 0,
		ids: []
	});
	(0, import_react.useEffect)(() => {
		if (board?.session.status === "ended") rememberPlayers(board.players.map((p) => ({
			nickname: p.nickname,
			skill: p.skill,
			isDropIn: p.isDropIn
		})));
	}, [board?.session.status, board?.players]);
	const nameOf = (0, import_react.useMemo)(() => {
		const map = new Map(board?.players.map((p) => [p.id, p.nickname]) ?? []);
		return (id) => map.get(id) ?? "—";
	}, [board?.players]);
	const clearTimer = () => {
		if (longPress.current) {
			window.clearTimeout(longPress.current);
			longPress.current = null;
		}
	};
	const beginPointer = (ids, label, e) => {
		if (!api.canEdit) return;
		e.preventDefault();
		e.currentTarget.setPointerCapture?.(e.pointerId);
		dragging.current = false;
		startPt.current = {
			x: e.clientX,
			y: e.clientY,
			ids
		};
		const player = board?.players.find((p) => p.id === ids[0]);
		clearTimer();
		longPress.current = window.setTimeout(() => {
			if (!dragging.current && player && ids.length === 1) {
				setMenuPlayer(player);
				setDrag(null);
			}
		}, 420);
		const move = (ev) => {
			const dx = ev.clientX - startPt.current.x;
			const dy = ev.clientY - startPt.current.y;
			if (!dragging.current && Math.hypot(dx, dy) > 10) {
				dragging.current = true;
				clearTimer();
			}
			if (dragging.current) setDrag({
				ids,
				label,
				x: ev.clientX,
				y: ev.clientY
			});
		};
		const up = (ev) => {
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", up);
			clearTimer();
			const wasDrag = dragging.current;
			dragging.current = false;
			setDrag(null);
			if (!wasDrag) return;
			const dest = dropFromPoint(ev.clientX, ev.clientY);
			if (!dest) return;
			api.run({
				type: "move",
				playerIds: ids,
				dest
			});
		};
		window.addEventListener("pointermove", move);
		window.addEventListener("pointerup", up);
	};
	if (api.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "flex min-h-dvh items-center justify-center text-muted-foreground",
		children: "看板載入中…"
	});
	if (api.error || !board) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-dvh flex-col items-center justify-center gap-3 p-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: api.error?.message ?? "找不到這個場次" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			asChild: true,
			variant: "secondary",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				children: "回首頁"
			})
		})]
	});
	const session = board.session;
	const courts = Array.from({ length: session.courtCount }, (_, i) => i + 1);
	const rest = board.players.filter((p) => p.status === "rest" || p.status === "force_rest").sort((a, b) => currentWaitSec(b.lastWaitStart, b.waitTotalSec, now) - currentWaitSec(a.lastWaitStart, a.waitTotalSec, now));
	const sideline = board.players.filter((p) => p.status === "not_arrived" || p.status === "left");
	const endMs = Date.parse(`${session.sessionDate}T${session.endTime}:00`);
	const remainSession = Number.isFinite(endMs) ? (endMs - now) / 1e3 : 0;
	const requestEnd = (courtNo) => {
		if (session.scoringEnabled) setScoreCourt(courtNo);
		else api.run({
			type: "endMatch",
			courtNo
		});
	};
	const copyCode = async () => {
		const url = `${window.location.origin}/s/${session.code}`;
		try {
			await navigator.clipboard.writeText(url);
			toast.success("已複製場次連結");
		} catch {
			toast.message(session.code);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-dvh flex-col bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "sticky top-0 z-30 border-b border-border bg-background/95 px-3 py-2 backdrop-blur-sm lg:px-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/",
							className: "font-display text-lg tracking-tight",
							children: "羽排"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-muted-foreground",
							children: "/"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-sm font-medium",
								children: [
									session.venueName,
									" · ",
									formatDateLabel(session.sessionDate)
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "tabular text-xs text-muted-foreground",
								children: [
									session.startTime,
									"–",
									session.endTime,
									Number.isFinite(endMs) ? ` · 剩餘 ${formatClock(remainSession)}` : ""
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: copyCode,
							className: "ml-auto inline-flex min-h-11 items-center gap-1 rounded-md bg-secondary px-3 font-display text-sm tracking-widest",
							children: [session.code, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCopy, { className: "size-3.5" })]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex flex-wrap gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							disabled: !api.canEdit,
							onClick: () => api.run({ type: "fillNext" }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }), "排下一場"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							disabled: !api.canEdit,
							onClick: () => api.run({ type: "reshuffleNext" }),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-3.5" }), "全部重排"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							disabled: !api.canUndo,
							onClick: () => api.undo(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3.5" }), "撤銷"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => setRosterOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5" }), "名單"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/s/$code/report",
								params: { code: session.code },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChartColumn, { className: "size-3.5" }), "報表"]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "ghost",
							onClick: () => setSettingsOpen(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "size-3.5" }), "設定"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							size: "sm",
							variant: "ghost",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/s/$code/me",
								params: { code: session.code },
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Smartphone, { className: "size-3.5" }), "我的狀態"]
							})
						})
					]
				})]
			}),
			!api.canEdit ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "bg-accent px-4 py-2 text-sm text-accent-foreground",
				children: session.status === "ended" ? "場次已結束，看板只讀。" : board.isHost ? "主控在另一台裝置。可在設定取得主控。" : "目前為只讀看板。球友請開「我的狀態」；團主請在設定貼上主控密鑰。"
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "flex flex-1 flex-col gap-4 p-3 lg:p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-2 text-xs font-medium tracking-wide text-muted-foreground",
						children: "場上"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex snap-x gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible",
						children: courts.map((no) => {
							const on = board.players.filter((p) => p.status === "on_court" && p.courtNo === no);
							const match = board.matches.find((m) => m.status === "live" && m.courtNo === no);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-64 shrink-0 snap-start lg:w-auto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CourtCard, {
									courtNo: no,
									players: on,
									match,
									now,
									nameOf,
									canEdit: api.canEdit,
									onEnd: () => requestEnd(no),
									onPause: () => api.run({
										type: "pauseMatch",
										courtNo: no
									}),
									onResume: () => api.run({
										type: "resumeMatch",
										courtNo: no
									}),
									onExtend: () => api.run({
										type: "extendMatch",
										courtNo: no,
										extraSec: 120
									}),
									onPointerPlayer: (p, e) => beginPointer([p.id], p.nickname, e)
								})
							}, no);
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mb-2 text-xs font-medium tracking-wide text-muted-foreground",
						children: "下一場"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex snap-x gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible",
						children: courts.map((no) => {
							const queued = board.players.filter((p) => p.status === "queued" && p.courtNo === no);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "w-64 shrink-0 snap-start lg:w-auto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NextSlot, {
									courtNo: no,
									players: queued,
									now,
									nameOf,
									onPointerPlayer: (p, e) => beginPointer([p.id], p.nickname, e),
									onPointerPair: (e) => beginPointer(queued.map((p) => p.id), queued.map((p) => p.nickname).join(" vs "), e)
								})
							}, no);
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						"data-drop": "rest",
						className: "min-h-36 rounded-xl border border-dashed border-border bg-card/60 p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mb-2 text-xs font-medium tracking-wide text-muted-foreground",
								children: "休息區"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [rest.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nameplate, {
									player: p,
									now,
									lastOpponentName: p.lastOpponentId ? nameOf(p.lastOpponentId) : null,
									onPointerDown: (e) => beginPointer([p.id], p.nickname, e)
								}, p.id)), rest.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: "休息區是空的。"
								}) : null]
							}),
							sideline.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mb-2 text-xs text-muted-foreground",
									children: "未到 / 離場"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-2",
									children: sideline.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Nameplate, {
										player: p,
										now,
										dim: true,
										onPointerDown: (e) => beginPointer([p.id], p.nickname, e)
									}, p.id))
								})]
							}) : null
						]
					})
				]
			}),
			drag ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-lg",
				style: {
					left: drag.x,
					top: drag.y
				},
				children: drag.label
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RosterSheet, {
				open: rosterOpen,
				onOpenChange: setRosterOpen,
				api,
				players: board.players
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsSheet, {
				open: settingsOpen,
				onOpenChange: setSettingsOpen,
				api,
				session
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: Boolean(menuPlayer),
				onOpenChange: () => {
					setMenuPlayer(null);
					setPickMode(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
					side: "bottom",
					className: "p-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, { children: menuPlayer?.nickname }) }), menuPlayer && !pickMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2 p-6 pt-2",
						children: [
							[
								["rest", "休息"],
								["force_rest", "強制休息"],
								["not_arrived", "未到"],
								["left", "離場"]
							].map(([status, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => {
									api.run({
										type: "setStatus",
										playerId: menuPlayer.id,
										status
									});
									setMenuPlayer(null);
								},
								children: label
							}, status)),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => {
									api.run({
										type: "setLocked",
										playerId: menuPlayer.id,
										locked: !menuPlayer.locked
									});
									setMenuPlayer(null);
								},
								children: menuPlayer.locked ? "解除鎖定" : "鎖定不排"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => setPickMode("preferred"),
								children: "指定對戰"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => setPickMode("blacklist"),
								children: "不要同場"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "col-span-2 text-xs text-muted-foreground",
								children: [
									STATUS_LABELS[menuPlayer.status],
									" · 已打 ",
									menuPlayer.playCount,
									" 場 · 輪空",
									" ",
									menuPlayer.byeCount
								]
							})
						]
					}) : menuPlayer && pickMode ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col gap-2 p-6 pt-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: pickMode === "preferred" ? "選一位優先對戰" : "選一位永不排在一起"
						}), board.players.filter((p) => p.id !== menuPlayer.id).map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => {
								api.run({
									type: "addRestriction",
									kind: pickMode,
									playerAId: menuPlayer.id,
									playerBId: p.id
								});
								setMenuPlayer(null);
								setPickMode(null);
							},
							children: p.nickname
						}, p.id))]
					}) : null]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScoreDialog, {
				open: scoreCourt != null,
				courtNo: scoreCourt,
				players: scoreCourt ? board.players.filter((p) => p.status === "on_court" && p.courtNo === scoreCourt) : [],
				onClose: () => setScoreCourt(null),
				onSubmit: (payload) => {
					if (scoreCourt == null) return;
					api.run({
						type: "endMatch",
						courtNo: scoreCourt,
						...payload
					});
					setScoreCourt(null);
				}
			})
		]
	});
}
function ScoreDialog({ open, courtNo, players, onClose, onSubmit }) {
	const [winner, setWinner] = (0, import_react.useState)(null);
	const a = players[0];
	const b = players[1];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (v) => !v && onClose(),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: [
				"第 ",
				courtNo,
				" 場結果"
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "可只記勝負，也可略過。" })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [a ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: winner === a.id ? "default" : "secondary",
					className: "flex-1",
					onClick: () => setWinner(a.id),
					children: [a.nickname, " 勝"]
				}) : null, b ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: winner === b.id ? "default" : "secondary",
					className: "flex-1",
					onClick: () => setWinner(b.id),
					children: [b.nickname, " 勝"]
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				onClick: () => onSubmit({}),
				children: "略過"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => onSubmit({ winnerId: winner }),
				children: "下場"
			})] })
		] })
	});
}
function SessionBoard() {
	const { code } = Route$2.useParams();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BoardView, { code: code.toUpperCase() });
}
//#endregion
export { SessionBoard as component };
