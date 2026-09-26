import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { WEIGHT_PRESETS } from "@/lib/yupai/matching";
import { MATCH_DURATIONS, type Session, type Weights, type WeightPreset, type Player, type Restriction } from "@/lib/yupai/types";
import type { BoardApi } from "@/hooks/use-board";
import { readHostToken } from "@/lib/yupai/client-session";
import { CountPicker, TimeSelect } from "@/components/ui/count-picker";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  api: BoardApi;
  session: Session;
  players: Player[];
  restrictions: Restriction[];
};

export function SettingsSheet({ open, onOpenChange, api, session, players, restrictions }: Props) {
  const [venueName, setVenueName] = useState(session.venueName);
  const [startTime, setStartTime] = useState(session.startTime);
  const [endTime, setEndTime] = useState(session.endTime);
  const [courtCount, setCourtCount] = useState(session.courtCount);
  const [duration, setDuration] = useState(session.matchDurationMin);
  const [consecutive, setConsecutive] = useState(session.consecutiveLimit);
  const [forceRest, setForceRest] = useState(session.forceRestAfterMatch);
  const [banRecent, setBanRecent] = useState(session.banRecentOpponent);
  const [scoring, setScoring] = useState(session.scoringEnabled);
  const [weights, setWeights] = useState<Weights>(session.weights);
  const [preset, setPreset] = useState<WeightPreset>(session.weightPreset);
  const [hostKey, setHostKey] = useState("");
  const [pin, setPin] = useState("");
  const token = readHostToken(session.code);

  useEffect(() => {
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

  const applyPreset = (key: "fair" | "intensity") => {
    setPreset(key);
    setWeights({ ...WEIGHT_PRESETS[key] });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto p-0">
        <SheetHeader>
          <SheetTitle>場次設定</SheetTitle>
          <SheetDescription>場次碼 {session.code}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-5 p-6">
          {api.canEdit ? (
            <>
              <Field label="場館">
                <Input value={venueName} onChange={(e) => setVenueName(e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="開始">
                  <TimeSelect value={startTime} onChange={setStartTime} />
                </Field>
                <Field label="結束">
                  <TimeSelect value={endTime} onChange={setEndTime} />
                </Field>
              </div>
              <Field label={`面數 ${courtCount}（一面兩人）`}>
                <CountPicker
                  value={courtCount}
                  min={1}
                  max={6}
                  ariaLabel="面數"
                  onChange={setCourtCount}
                />
              </Field>
              <div>
                <Label>每場時長</Label>
                <div className="mt-2 flex gap-2">
                  {MATCH_DURATIONS.map((m) => (
                    <Button
                      key={m}
                      type="button"
                      size="sm"
                      variant={duration === m ? "default" : "secondary"}
                      onClick={() => setDuration(m)}
                    >
                      {m} 分
                    </Button>
                  ))}
                </div>
              </div>
              <Field label={`連續打滿 ${consecutive} 場必須休息`}>
                <CountPicker
                  value={consecutive}
                  min={1}
                  max={4}
                  suffix=" 場"
                  ariaLabel="連續幾場必須休息"
                  onChange={setConsecutive}
                />
              </Field>
              <Toggle
                label="下場後強制休息 1 輪"
                checked={forceRest}
                onCheckedChange={setForceRest}
              />
              <Toggle
                label="剛互打完本輪禁止再遇"
                checked={banRecent}
                onCheckedChange={setBanRecent}
              />
              <Toggle
                label="下場填比分，並依比分調整程度"
                checked={scoring}
                onCheckedChange={setScoring}
              />
              <div>
                <Label>配對權重</Label>
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={preset === "fair" ? "default" : "secondary"}
                    onClick={() => applyPreset("fair")}
                  >
                    公平優先
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={preset === "intensity" ? "default" : "secondary"}
                    onClick={() => applyPreset("intensity")}
                  >
                    強度優先
                  </Button>
                </div>
                {(
                  [
                    ["wait", "等待"],
                    ["plays", "上場次數"],
                    ["rematch", "對手重複"],
                    ["skill", "程度差"],
                  ] as const
                ).map(([key, label]) => (
                  <Field key={key} label={`${label} ${weights[key]}`}>
                    <input
                      type="range"
                      min={0}
                      max={8}
                      value={weights[key]}
                      onChange={(e) => {
                        setPreset("custom");
                        setWeights({ ...weights, [key]: Number(e.target.value) });
                      }}
                      className="w-full accent-primary"
                    />
                  </Field>
                ))}
              </div>
              <div>
                <Label>指定對戰 / 不要同場</Label>
                <ul className="mt-2 flex flex-col gap-2">
                  {restrictions.length === 0 ? (
                    <li className="text-sm text-muted-foreground">
                      長按名牌可新增。這裡可以刪除。
                    </li>
                  ) : (
                    restrictions.map((r) => {
                      const a = players.find((p) => p.id === r.playerAId)?.nickname ?? "—";
                      const b = players.find((p) => p.id === r.playerBId)?.nickname ?? "—";
                      return (
                        <li
                          key={r.id}
                          className="flex items-center justify-between gap-2 rounded-lg bg-secondary px-3 py-2 text-sm"
                        >
                          <span>
                            {r.kind === "preferred" ? "指定" : "不要同場"} · {a} / {b}
                            {r.kind === "preferred" && r.used ? "（已用）" : ""}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => api.run({ type: "removeRestriction", id: r.id })}
                          >
                            刪
                          </Button>
                        </li>
                      );
                    })
                  )}
                </ul>
              </div>
              <Button
                onClick={() =>
                  api.run({
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
                      weightPreset: preset,
                    },
                  })
                }
              >
                儲存設定
              </Button>
              <Button
                variant="secondary"
                onClick={() => api.run({ type: "endSession" })}
              >
                結束場次
              </Button>
            </>
          ) : session.status === "ended" && api.board?.isHost ? (
            <Button onClick={() => api.run({ type: "reopenSession" })}>
              重開當日看板
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">目前為只讀，取得主控後可改設定。</p>
          )}

          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-medium">主控</p>
            <p className="mt-1 text-xs text-muted-foreground">
              同一場次只有一台裝置能改棋盤。球友用場次碼只看自己的狀態。
            </p>
            {api.board?.isController ? (
              <Button
                className="mt-3"
                variant="secondary"
                onClick={async () => {
                  const res = await api.startTransfer.mutateAsync();
                  if ("pin" in res) {
                    setPin(res.pin);
                  } else {
                    setPin("");
                  }
                }}
              >
                產生移交碼
              </Button>
            ) : null}
            {pin ? (
              <p className="mt-2 font-display text-3xl tracking-widest">{pin}</p>
            ) : null}
            <form
              className="mt-3 flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (hostKey.trim()) api.claim.mutate(hostKey.trim());
              }}
            >
              <Label htmlFor="host-key">主控密鑰</Label>
              <Input
                id="host-key"
                value={hostKey}
                onChange={(e) => setHostKey(e.target.value)}
                placeholder={token ? "已儲存在此裝置" : "貼上主控密鑰"}
              />
              <Button type="submit" variant="secondary">
                取得主控
              </Button>
            </form>
            <form
              className="mt-3 flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const value = pinInputValue(e);
                if (value.trim()) api.acceptTransfer.mutate(value.trim());
              }}
            >
              <Label htmlFor="xfer">移交碼</Label>
              <Input id="xfer" name="pin" placeholder="四位數字" maxLength={4} />
              <Button type="submit" variant="outline">
                用移交碼接下主控
              </Button>
            </form>
            {token ? (
              <p className="mt-3 break-all text-xs text-muted-foreground">
                此裝置密鑰：{token}
              </p>
            ) : null}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function pinInputValue(e: React.FormEvent<HTMLFormElement>) {
  const fd = new FormData(e.currentTarget);
  return String(fd.get("pin") ?? "");
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm">
      {label}
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </label>
  );
}
