import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  acceptTransferFn,
  claimControlFn,
  getBoardFn,
  mutateBoardFn,
  startTransferFn,
  undoBoardFn,
} from "@/lib/yupai/api";
import { getDeviceId, readHostToken, writeHostToken } from "@/lib/yupai/client-session";
import type { BoardAction, BoardPayload } from "@/lib/yupai/types";

function isPayload(x: unknown): x is BoardPayload {
  return Boolean(x && typeof x === "object" && "players" in x && "session" in x);
}

export function useBoard(code: string) {
  const qc = useQueryClient();
  const deviceId = useMemo(() => getDeviceId(), []);
  const hostToken = readHostToken(code);
  const queryKey = ["board", code, hostToken, deviceId] as const;

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await getBoardFn({
        data: { code, hostToken: hostToken ?? undefined, deviceId },
      });
      if (!isPayload(res)) throw new Error("error" in res ? res.error : "讀取失敗");
      return res;
    },
    refetchInterval: 1500,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  });

  const applyPayload = useCallback(
    (res: unknown) => {
      if (isPayload(res)) {
        qc.setQueryData(queryKey, res);
        if (res.conflict && res.warning) toast.warning(res.warning);
        else if (res.warning) toast.warning(res.warning);
        else if (res.message) toast.success(res.message);
        return res;
      }
      if (res && typeof res === "object" && "error" in res) {
        toast.error(String((res as { error: string }).error));
        void query.refetch();
      }
      return null;
    },
    [qc, query, queryKey],
  );

  const mutate = useMutation({
    mutationFn: async (action: BoardAction) => {
      if (!hostToken) throw new Error("沒有主控權限");
      const version = query.data?.version ?? 0;
      return mutateBoardFn({
        data: {
          code,
          hostToken,
          deviceId,
          expectedVersion: version,
          action,
        },
      });
    },
    onSuccess: applyPayload,
    onError: (err: Error) => toast.error(err.message),
  });

  const undo = useMutation({
    mutationFn: async () => {
      if (!hostToken) throw new Error("沒有主控權限");
      return undoBoardFn({
        data: {
          code,
          hostToken,
          deviceId,
          expectedVersion: query.data?.version ?? 0,
        },
      });
    },
    onSuccess: applyPayload,
    onError: (err: Error) => toast.error(err.message),
  });

  const claim = useMutation({
    mutationFn: async (token: string) => {
      writeHostToken(code, token);
      return claimControlFn({
        data: { code, hostToken: token, deviceId },
      });
    },
    onSuccess: (res) => {
      applyPayload(res);
      qc.invalidateQueries({ queryKey: ["board", code] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const startTransfer = useMutation({
    mutationFn: async () => {
      if (!hostToken) throw new Error("沒有主控權限");
      return startTransferFn({ data: { code, hostToken, deviceId } });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const acceptTransfer = useMutation({
    mutationFn: async (pin: string) => {
      return acceptTransferFn({ data: { code, pin, deviceId } });
    },
    onSuccess: (res) => {
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      writeHostToken(code, res.hostToken);
      applyPayload(res.payload);
      qc.invalidateQueries({ queryKey: ["board", code] });
    },
  });

  const canEdit = Boolean(
    query.data?.isController && query.data.session.status === "active",
  );

  return {
    code,
    deviceId,
    hostToken,
    board: query.data,
    isLoading: query.isLoading,
    error: query.error,
    canEdit,
    run: (action: BoardAction) => mutate.mutate(action),
    runAsync: (action: BoardAction) => mutate.mutateAsync(action),
    pending: mutate.isPending,
    undo: () => undo.mutate(),
    canUndo: Boolean(query.data?.canUndo && canEdit),
    claim,
    startTransfer,
    acceptTransfer,
    refetch: query.refetch,
  };
}

export type BoardApi = ReturnType<typeof useBoard>;
