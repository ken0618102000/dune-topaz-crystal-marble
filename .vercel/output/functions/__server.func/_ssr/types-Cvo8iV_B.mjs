import "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { n as require_jsx_runtime } from "../_libs/radix-ui__react-context+react.mjs";
import { d as Slot } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as number, n as boolean, o as object, r as custom, s as string, t as _enum } from "../_libs/zod.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
require_react();
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-11", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
			outline: "border border-border bg-transparent hover:bg-secondary",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			ghost: "hover:bg-secondary",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-11 px-4 py-2",
			sm: "h-9 min-h-9 rounded-md px-3 text-sm",
			lg: "h-12 min-h-12 rounded-lg px-6 text-base",
			icon: "size-11 p-0"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		"data-slot": "button",
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var creds = object({
	code: string().min(4).max(12),
	hostToken: string().optional(),
	deviceId: string().optional()
});
var getBoardFn = createServerFn({ method: "POST" }).validator(creds).handler(createSsrRpc("91e6ddef0546fe155f5c7330683ba2110d9491b938425aa69a0c5078b25c552f"));
var createSchema = object({
	venueName: string(),
	sessionDate: string(),
	startTime: string(),
	endTime: string(),
	courtCount: number(),
	matchDurationMin: number(),
	consecutiveLimit: number(),
	forceRestAfterMatch: boolean(),
	banRecentOpponent: boolean(),
	scoringEnabled: boolean(),
	weights: object({
		wait: number(),
		plays: number(),
		rematch: number(),
		skill: number()
	}),
	weightPreset: _enum([
		"fair",
		"intensity",
		"custom"
	]),
	deviceId: string()
});
var createSessionFn = createServerFn({ method: "POST" }).validator(createSchema).handler(createSsrRpc("23de6dc9dbe5ae26eb149d50fadd3c8f910644651d5a2a7748b679a80ff9ef29"));
var createDemoFn = createServerFn({ method: "POST" }).validator(object({ deviceId: string() })).handler(createSsrRpc("9cd5ae0e70f7cdc72dc61bfc7071ec010989d3ecf77c653bb9a6bd0bd5f70d46"));
var mutateBoardFn = createServerFn({ method: "POST" }).validator(object({
	code: string(),
	hostToken: string(),
	deviceId: string(),
	expectedVersion: number(),
	action: custom()
})).handler(createSsrRpc("81db569df4a75f8d985bc36c4a9c77b3b5a6bd5cfbbd8688bbd070c1066b45f0"));
var undoBoardFn = createServerFn({ method: "POST" }).validator(object({
	code: string(),
	hostToken: string(),
	deviceId: string(),
	expectedVersion: number()
})).handler(createSsrRpc("eafeeecd2101921984645c5825dee744e7b862292e05e3616045ef8cb1f4185b"));
var claimControlFn = createServerFn({ method: "POST" }).validator(object({
	code: string(),
	hostToken: string(),
	deviceId: string()
})).handler(createSsrRpc("85888758518c103ee1a8f35ffcc4c80cd134d2fa684cead066e9d54bb5e8446a"));
var startTransferFn = createServerFn({ method: "POST" }).validator(object({
	code: string(),
	hostToken: string(),
	deviceId: string()
})).handler(createSsrRpc("09f0974582d68efe754958a5add5098dce7b672c284bfb758f23ca22256774cb"));
var acceptTransferFn = createServerFn({ method: "POST" }).validator(object({
	code: string(),
	pin: string(),
	deviceId: string()
})).handler(createSsrRpc("58ac3c014a878d59f5504a253b72fd22ab3c98652cfe86b743e9a3cc323267f5"));
var DEVICE_KEY = "yupai:device";
function getDeviceId() {
	if (typeof window === "undefined") return "";
	let id = localStorage.getItem(DEVICE_KEY);
	if (!id) {
		id = crypto.randomUUID();
		localStorage.setItem(DEVICE_KEY, id);
	}
	return id;
}
function hostTokenKey(code) {
	return `yupai:host:${code.toUpperCase()}`;
}
function readHostToken(code) {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(hostTokenKey(code));
}
function writeHostToken(code, token) {
	localStorage.setItem(hostTokenKey(code), token);
}
function readFrequent() {
	if (typeof window === "undefined") return [];
	try {
		const raw = localStorage.getItem("yupai:frequent");
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function writeFrequent(list) {
	localStorage.setItem("yupai:frequent", JSON.stringify(list.slice(0, 80)));
}
function rememberPlayers(players) {
	const current = readFrequent();
	const map = new Map(current.map((p) => [p.nickname, p]));
	for (const p of players) if (p.isDropIn) map.delete(p.nickname);
	else map.set(p.nickname, {
		nickname: p.nickname,
		skill: p.skill
	});
	writeFrequent([...map.values()]);
}
function selfKey(code) {
	return `yupai:self:${code.toUpperCase()}`;
}
function readSelfId(code) {
	if (typeof window === "undefined") return null;
	return localStorage.getItem(selfKey(code));
}
function writeSelfId(code, playerId) {
	localStorage.setItem(selfKey(code), playerId);
}
var SKILL_LABELS = [
	"",
	"初學",
	"入門",
	"中等",
	"進階",
	"高手"
];
var STATUS_LABELS = {
	not_arrived: "未到",
	rest: "休息",
	queued: "排隊中",
	on_court: "場上",
	force_rest: "強制休息",
	left: "離場"
};
var MATCH_DURATIONS = [
	8,
	10,
	12,
	15
];
//#endregion
export { startTransferFn as _, acceptTransferFn as a, writeSelfId as b, createDemoFn as c, getDeviceId as d, mutateBoardFn as f, rememberPlayers as g, readSelfId as h, STATUS_LABELS as i, createSessionFn as l, readHostToken as m, MATCH_DURATIONS as n, claimControlFn as o, readFrequent as p, SKILL_LABELS as r, cn as s, Button as t, getBoardFn as u, undoBoardFn as v, writeHostToken as y };
