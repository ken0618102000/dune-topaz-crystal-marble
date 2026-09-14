import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { _ as startTransferFn, a as acceptTransferFn, d as getDeviceId, f as mutateBoardFn, m as readHostToken, o as claimControlFn, u as getBoardFn, v as undoBoardFn, y as writeHostToken } from "./types-Cvo8iV_B.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-now-CxdYqPIW.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function isPayload(x) {
	return Boolean(x && typeof x === "object" && "players" in x && "session" in x);
}
function useBoard(code) {
	const qc = useQueryClient();
	const deviceId = (0, import_react.useMemo)(() => getDeviceId(), []);
	const hostToken = readHostToken(code);
	const queryKey = [
		"board",
		code,
		hostToken,
		deviceId
	];
	const query = useQuery({
		queryKey,
		queryFn: async () => {
			const res = await getBoardFn({ data: {
				code,
				hostToken: hostToken ?? void 0,
				deviceId
			} });
			if (!isPayload(res)) throw new Error("error" in res ? res.error : "讀取失敗");
			return res;
		},
		refetchInterval: 1500,
		refetchIntervalInBackground: false,
		refetchOnWindowFocus: true
	});
	const applyPayload = (0, import_react.useCallback)((res) => {
		if (isPayload(res)) {
			qc.setQueryData(queryKey, res);
			if (res.conflict && res.warning) toast.warning(res.warning);
			else if (res.warning) toast.warning(res.warning);
			else if (res.message) toast.success(res.message);
			return res;
		}
		if (res && typeof res === "object" && "error" in res) {
			toast.error(String(res.error));
			query.refetch();
		}
		return null;
	}, [
		qc,
		query,
		queryKey
	]);
	const mutate = useMutation({
		mutationFn: async (action) => {
			if (!hostToken) throw new Error("沒有主控權限");
			const version = query.data?.version ?? 0;
			return mutateBoardFn({ data: {
				code,
				hostToken,
				deviceId,
				expectedVersion: version,
				action
			} });
		},
		onSuccess: applyPayload,
		onError: (err) => toast.error(err.message)
	});
	const undo = useMutation({
		mutationFn: async () => {
			if (!hostToken) throw new Error("沒有主控權限");
			return undoBoardFn({ data: {
				code,
				hostToken,
				deviceId,
				expectedVersion: query.data?.version ?? 0
			} });
		},
		onSuccess: applyPayload,
		onError: (err) => toast.error(err.message)
	});
	const claim = useMutation({
		mutationFn: async (token) => {
			writeHostToken(code, token);
			return claimControlFn({ data: {
				code,
				hostToken: token,
				deviceId
			} });
		},
		onSuccess: (res) => {
			applyPayload(res);
			qc.invalidateQueries({ queryKey: ["board", code] });
		},
		onError: (err) => toast.error(err.message)
	});
	const startTransfer = useMutation({
		mutationFn: async () => {
			if (!hostToken) throw new Error("沒有主控權限");
			return startTransferFn({ data: {
				code,
				hostToken,
				deviceId
			} });
		},
		onError: (err) => toast.error(err.message)
	});
	const acceptTransfer = useMutation({
		mutationFn: async (pin) => {
			return acceptTransferFn({ data: {
				code,
				pin,
				deviceId
			} });
		},
		onSuccess: (res) => {
			if ("error" in res) {
				toast.error(res.error);
				return;
			}
			writeHostToken(code, res.hostToken);
			applyPayload(res.payload);
			qc.invalidateQueries({ queryKey: ["board", code] });
		}
	});
	const canEdit = Boolean(query.data?.isController && query.data.session.status === "active");
	return {
		code,
		deviceId,
		hostToken,
		board: query.data,
		isLoading: query.isLoading,
		error: query.error,
		canEdit,
		run: (action) => mutate.mutate(action),
		runAsync: (action) => mutate.mutateAsync(action),
		pending: mutate.isPending,
		undo: () => undo.mutate(),
		canUndo: Boolean(query.data?.canUndo && canEdit),
		claim,
		startTransfer,
		acceptTransfer,
		refetch: query.refetch
	};
}
function useNow(interval = 250) {
	const [now, setNow] = (0, import_react.useState)(() => Date.now());
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setNow(Date.now()), interval);
		return () => window.clearInterval(id);
	}, [interval]);
	return now;
}
//#endregion
export { useNow as n, useBoard as t };
