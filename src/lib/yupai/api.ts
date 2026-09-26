import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { boardActionSchema } from "./action-schema.ts";
import type { BoardPayload, CreateSessionInput } from "./types.ts";

const creds = z.object({
  code: z.string().min(4).max(12),
  hostToken: z.string().optional(),
  deviceId: z.string().optional(),
});

export const getBoardFn = createServerFn({ method: "POST" })
  .validator(creds)
  .handler(async ({ data }): Promise<BoardPayload | { error: string }> => {
    const { fetchBoard } = await import("./persist.server.ts");
    return fetchBoard({
      code: data.code,
      hostToken: data.hostToken,
      deviceId: data.deviceId,
    });
  });

const createSchema = z.object({
  venueName: z.string(),
  sessionDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  courtCount: z.coerce.number().int().min(1).max(6),
  matchDurationMin: z.coerce.number().int().min(5).max(30),
  consecutiveLimit: z.coerce.number().int().min(1).max(6),
  forceRestAfterMatch: z.boolean(),
  banRecentOpponent: z.boolean(),
  scoringEnabled: z.boolean(),
  weights: z.object({
    wait: z.number(),
    plays: z.number(),
    rematch: z.number(),
    skill: z.number(),
  }),
  weightPreset: z.enum(["fair", "intensity", "custom"]),
  deviceId: z.string(),
});

export const createSessionFn = createServerFn({ method: "POST" })
  .validator(createSchema)
  .handler(async ({ data }) => {
    const { createSessionRecord, loadState, boardPayload } = await import(
      "./persist.server.ts"
    );
    const created = await createSessionRecord(data as CreateSessionInput);
    const loaded = await loadState(created.code);
    if (!loaded) return { error: "建立後讀取失敗" as const };
    return {
      code: created.code,
      hostToken: created.hostToken,
      payload: boardPayload(loaded, created.hostToken, data.deviceId),
    };
  });

export const createDemoFn = createServerFn({ method: "POST" })
  .validator(z.object({ deviceId: z.string() }))
  .handler(async ({ data }) => {
    const { seedDemo } = await import("./persist.server.ts");
    const { todayISO } = await import("./format.ts");
    const { WEIGHT_PRESETS } = await import("./matching.ts");
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
      scoringEnabled: true,
      weights: WEIGHT_PRESETS.fair,
      weightPreset: "fair",
      deviceId: data.deviceId,
    });
    return {
      code: result.created.code,
      hostToken: result.created.hostToken,
      payload: result.payload,
    };
  });

export const mutateBoardFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: z.string(),
      hostToken: z.string(),
      deviceId: z.string(),
      expectedVersion: z.number(),
      action: boardActionSchema,
    }),
  )
  .handler(async ({ data }) => {
    const { mutateBoard } = await import("./persist.server.ts");
    return mutateBoard(data);
  });

export const undoBoardFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: z.string(),
      hostToken: z.string(),
      deviceId: z.string(),
      expectedVersion: z.number(),
    }),
  )
  .handler(async ({ data }) => {
    const { undoBoard } = await import("./persist.server.ts");
    return undoBoard(data);
  });

export const claimControlFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: z.string(),
      hostToken: z.string(),
      deviceId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const { claimControl } = await import("./persist.server.ts");
    return claimControl(data);
  });

export const startTransferFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: z.string(),
      hostToken: z.string(),
      deviceId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const { startHostTransfer } = await import("./persist.server.ts");
    return startHostTransfer(data);
  });

export const acceptTransferFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      code: z.string(),
      pin: z.string(),
      deviceId: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const { acceptHostTransfer } = await import("./persist.server.ts");
    return acceptHostTransfer(data);
  });
