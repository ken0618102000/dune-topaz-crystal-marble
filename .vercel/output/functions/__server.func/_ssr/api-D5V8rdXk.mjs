import { n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as number, n as boolean, o as object, r as custom, s as string, t as _enum } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-D5V8rdXk.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
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
var getBoardFn_createServerFn_handler = createServerRpc({
	id: "91e6ddef0546fe155f5c7330683ba2110d9491b938425aa69a0c5078b25c552f",
	name: "getBoardFn",
	filename: "src/lib/yupai/api.ts"
}, (opts) => getBoardFn.__executeServer(opts));
var getBoardFn = createServerFn({ method: "POST" }).validator(creds).handler(getBoardFn_createServerFn_handler, async ({ data }) => {
	const { fetchBoard } = await import("./persist.server-8760gIzF.mjs");
	return fetchBoard({
		code: data.code,
		hostToken: data.hostToken,
		deviceId: data.deviceId
	});
});
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
var createSessionFn_createServerFn_handler = createServerRpc({
	id: "23de6dc9dbe5ae26eb149d50fadd3c8f910644651d5a2a7748b679a80ff9ef29",
	name: "createSessionFn",
	filename: "src/lib/yupai/api.ts"
}, (opts) => createSessionFn.__executeServer(opts));
var createSessionFn = createServerFn({ method: "POST" }).validator(createSchema).handler(createSessionFn_createServerFn_handler, async ({ data }) => {
	const { createSessionRecord, loadState, boardPayload } = await import("./persist.server-8760gIzF.mjs");
	const created = await createSessionRecord(data);
	const loaded = await loadState(created.code);
	if (!loaded) return { error: "建立後讀取失敗" };
	return {
		code: created.code,
		hostToken: created.hostToken,
		payload: boardPayload(loaded, created.hostToken, data.deviceId)
	};
});
var createDemoFn_createServerFn_handler = createServerRpc({
	id: "9cd5ae0e70f7cdc72dc61bfc7071ec010989d3ecf77c653bb9a6bd0bd5f70d46",
	name: "createDemoFn",
	filename: "src/lib/yupai/api.ts"
}, (opts) => createDemoFn.__executeServer(opts));
var createDemoFn = createServerFn({ method: "POST" }).validator(object({ deviceId: string() })).handler(createDemoFn_createServerFn_handler, async ({ data }) => {
	const { seedDemo } = await import("./persist.server-8760gIzF.mjs");
	const { todayISO } = await import("./format-cH6pj9B9.mjs").then((n) => n.o);
	const { WEIGHT_PRESETS } = await import("./matching-DtfUiZax.mjs").then((n) => n.n);
	const result = await seedDemo({
		venueName: "鄰里羽球場",
		sessionDate: todayISO(),
		startTime: "19:00",
		endTime: "22:00",
		courtCount: 4,
		matchDurationMin: 12,
		consecutiveLimit: 2,
		forceRestAfterMatch: true,
		banRecentOpponent: false,
		scoringEnabled: false,
		weights: WEIGHT_PRESETS.fair,
		weightPreset: "fair",
		deviceId: data.deviceId
	});
	return {
		code: result.created.code,
		hostToken: result.created.hostToken,
		payload: result.payload
	};
});
var mutateBoardFn_createServerFn_handler = createServerRpc({
	id: "81db569df4a75f8d985bc36c4a9c77b3b5a6bd5cfbbd8688bbd070c1066b45f0",
	name: "mutateBoardFn",
	filename: "src/lib/yupai/api.ts"
}, (opts) => mutateBoardFn.__executeServer(opts));
var mutateBoardFn = createServerFn({ method: "POST" }).validator(object({
	code: string(),
	hostToken: string(),
	deviceId: string(),
	expectedVersion: number(),
	action: custom()
})).handler(mutateBoardFn_createServerFn_handler, async ({ data }) => {
	const { mutateBoard } = await import("./persist.server-8760gIzF.mjs");
	return mutateBoard(data);
});
var undoBoardFn_createServerFn_handler = createServerRpc({
	id: "eafeeecd2101921984645c5825dee744e7b862292e05e3616045ef8cb1f4185b",
	name: "undoBoardFn",
	filename: "src/lib/yupai/api.ts"
}, (opts) => undoBoardFn.__executeServer(opts));
var undoBoardFn = createServerFn({ method: "POST" }).validator(object({
	code: string(),
	hostToken: string(),
	deviceId: string(),
	expectedVersion: number()
})).handler(undoBoardFn_createServerFn_handler, async ({ data }) => {
	const { undoBoard } = await import("./persist.server-8760gIzF.mjs");
	return undoBoard(data);
});
var claimControlFn_createServerFn_handler = createServerRpc({
	id: "85888758518c103ee1a8f35ffcc4c80cd134d2fa684cead066e9d54bb5e8446a",
	name: "claimControlFn",
	filename: "src/lib/yupai/api.ts"
}, (opts) => claimControlFn.__executeServer(opts));
var claimControlFn = createServerFn({ method: "POST" }).validator(object({
	code: string(),
	hostToken: string(),
	deviceId: string()
})).handler(claimControlFn_createServerFn_handler, async ({ data }) => {
	const { claimControl } = await import("./persist.server-8760gIzF.mjs");
	return claimControl(data);
});
var startTransferFn_createServerFn_handler = createServerRpc({
	id: "09f0974582d68efe754958a5add5098dce7b672c284bfb758f23ca22256774cb",
	name: "startTransferFn",
	filename: "src/lib/yupai/api.ts"
}, (opts) => startTransferFn.__executeServer(opts));
var startTransferFn = createServerFn({ method: "POST" }).validator(object({
	code: string(),
	hostToken: string(),
	deviceId: string()
})).handler(startTransferFn_createServerFn_handler, async ({ data }) => {
	const { startHostTransfer } = await import("./persist.server-8760gIzF.mjs");
	return startHostTransfer(data);
});
var acceptTransferFn_createServerFn_handler = createServerRpc({
	id: "58ac3c014a878d59f5504a253b72fd22ab3c98652cfe86b743e9a3cc323267f5",
	name: "acceptTransferFn",
	filename: "src/lib/yupai/api.ts"
}, (opts) => acceptTransferFn.__executeServer(opts));
var acceptTransferFn = createServerFn({ method: "POST" }).validator(object({
	code: string(),
	pin: string(),
	deviceId: string()
})).handler(acceptTransferFn_createServerFn_handler, async ({ data }) => {
	const { acceptHostTransfer } = await import("./persist.server-8760gIzF.mjs");
	return acceptHostTransfer(data);
});
//#endregion
export { acceptTransferFn_createServerFn_handler, claimControlFn_createServerFn_handler, createDemoFn_createServerFn_handler, createSessionFn_createServerFn_handler, getBoardFn_createServerFn_handler, mutateBoardFn_createServerFn_handler, startTransferFn_createServerFn_handler, undoBoardFn_createServerFn_handler };
