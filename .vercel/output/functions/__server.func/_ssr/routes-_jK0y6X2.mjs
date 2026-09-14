import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { v as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { c as todayISO } from "./format-cH6pj9B9.mjs";
import { t as WEIGHT_PRESETS } from "./matching-DtfUiZax.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { c as createDemoFn, d as getDeviceId, l as createSessionFn, n as MATCH_DURATIONS, t as Button, y as writeHostToken } from "./types-Cvo8iV_B.mjs";
import { n as Label, r as Switch, t as Input } from "./switch-ySLdcKGy.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-_jK0y6X2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LandingPage() {
	const navigate = useNavigate();
	const [joinCode, setJoinCode] = (0, import_react.useState)("");
	const [venueName, setVenueName] = (0, import_react.useState)("鄰里羽球場");
	const [sessionDate, setSessionDate] = (0, import_react.useState)(todayISO());
	const [startTime, setStartTime] = (0, import_react.useState)("19:00");
	const [endTime, setEndTime] = (0, import_react.useState)("22:00");
	const [courtCount, setCourtCount] = (0, import_react.useState)(4);
	const [duration, setDuration] = (0, import_react.useState)(12);
	const [consecutive, setConsecutive] = (0, import_react.useState)(2);
	const [forceRest, setForceRest] = (0, import_react.useState)(true);
	const [preset, setPreset] = (0, import_react.useState)("fair");
	const [weights, setWeights] = (0, import_react.useState)({ ...WEIGHT_PRESETS.fair });
	const [busy, setBusy] = (0, import_react.useState)(false);
	const goBoard = (code, token) => {
		writeHostToken(code, token);
		navigate({
			to: "/s/$code",
			params: { code }
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-dvh max-w-5xl flex-col gap-10 px-5 py-10 lg:py-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm tracking-[0.25em] text-primary",
					children: "YUPAI"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-5xl leading-none tracking-tight lg:text-7xl",
					children: "羽排"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-md text-lg text-muted-foreground",
					children: "當日現場單打排點看板。團主用平板橫向改棋盤，球友手機只看自己的狀態。"
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CourtHero, {})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "grid gap-6 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "flex flex-col gap-4 rounded-xl bg-card p-5",
				onSubmit: async (e) => {
					e.preventDefault();
					setBusy(true);
					try {
						const res = await createSessionFn({ data: {
							venueName,
							sessionDate,
							startTime,
							endTime,
							courtCount,
							matchDurationMin: duration,
							consecutiveLimit: consecutive,
							forceRestAfterMatch: forceRest,
							banRecentOpponent: false,
							scoringEnabled: false,
							weights,
							weightPreset: preset,
							deviceId: getDeviceId()
						} });
						if ("error" in res) {
							toast.error(res.error);
							return;
						}
						goBoard(res.code, res.hostToken);
					} catch (err) {
						toast.error(err instanceof Error ? err.message : "建立失敗");
					} finally {
						setBusy(false);
					}
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "text-lg font-semibold",
						children: "建立今日場次"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "場館",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: venueName,
							onChange: (e) => setVenueName(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "日期",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "date",
									value: sessionDate,
									onChange: (e) => setSessionDate(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: `面數 ${courtCount}`,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "range",
									min: 1,
									max: 6,
									value: courtCount,
									onChange: (e) => setCourtCount(Number(e.target.value)),
									className: "mt-3 w-full accent-primary"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "開始",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "time",
									value: startTime,
									onChange: (e) => setStartTime(e.target.value)
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "結束",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									type: "time",
									value: endTime,
									onChange: (e) => setEndTime(e.target.value)
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "每場時長" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2 flex flex-wrap gap-2",
						children: MATCH_DURATIONS.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							size: "sm",
							variant: duration === m ? "default" : "secondary",
							onClick: () => setDuration(m),
							children: [m, " 分"]
						}, m))
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: `連續 ${consecutive} 場必須休息`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "range",
							min: 1,
							max: 4,
							value: consecutive,
							onChange: (e) => setConsecutive(Number(e.target.value)),
							className: "w-full accent-primary"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center justify-between text-sm",
						children: ["下場後強制休息 1 輪", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: forceRest,
							onCheckedChange: setForceRest
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: preset === "fair" ? "default" : "secondary",
							onClick: () => {
								setPreset("fair");
								setWeights({ ...WEIGHT_PRESETS.fair });
							},
							children: "公平優先"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "sm",
							variant: preset === "intensity" ? "default" : "secondary",
							onClick: () => {
								setPreset("intensity");
								setWeights({ ...WEIGHT_PRESETS.intensity });
							},
							children: "強度優先"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						size: "lg",
						disabled: busy,
						children: "開場"
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "flex flex-col gap-3 rounded-xl bg-card p-5",
						onSubmit: (e) => {
							e.preventDefault();
							const code = joinCode.trim().toUpperCase();
							if (code.length < 4) return;
							navigate({
								to: "/s/$code",
								params: { code }
							});
						},
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold",
								children: "加入場次"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "輸入場次碼。未持有主控密鑰的裝置預設只讀。"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: joinCode,
								onChange: (e) => setJoinCode(e.target.value.toUpperCase()),
								placeholder: "例如 A3K7MQ",
								className: "font-display tracking-[0.3em]",
								maxLength: 8
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								variant: "secondary",
								children: "進入看板"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl bg-card p-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-semibold",
								children: "先看示範"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-sm text-muted-foreground",
								children: "4 面場、13 人單打，含場上計時、下一場與休息區。可直接拖名牌、排下一場。"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "mt-4",
								variant: "outline",
								disabled: busy,
								onClick: async () => {
									setBusy(true);
									try {
										const res = await createDemoFn({ data: { deviceId: getDeviceId() } });
										goBoard(res.code, res.hostToken);
									} catch (err) {
										toast.error(err instanceof Error ? err.message : "無法開啟示範");
									} finally {
										setBusy(false);
									}
								},
								children: "開啟示範看板"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
						className: "space-y-2 text-sm text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "單打固定賽制，一面場兩人。" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "自動配對只填空場與下一場，不動正在打的人。" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: "不做訂場、報名、繳費或會員系統。" })
						]
					})
				]
			})]
		})]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: label }), children]
	});
}
function CourtHero() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"aria-hidden": true,
		className: "relative aspect-[4/3] overflow-hidden rounded-xl bg-court",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-4 border-2 border-line/80" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-4 bottom-4 left-1/2 w-0.5 -translate-x-1/2 bg-line/80" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute top-1/2 left-4 right-4 h-0.5 -translate-y-1/2 bg-line/40" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute top-[18%] left-[18%] rounded-lg bg-secondary px-3 py-2 text-sm",
				children: "阿明"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute right-[18%] bottom-[18%] rounded-lg bg-secondary px-3 py-2 text-sm",
				children: "佳玲"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "absolute bottom-6 left-1/2 -translate-x-1/2 font-display text-3xl tabular text-line",
				children: "8:12"
			})
		]
	});
}
var SplitComponent = LandingPage;
//#endregion
export { SplitComponent as component };
