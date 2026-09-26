import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CountPicker, TimeSelect } from "@/components/ui/count-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createDemoFn, createSessionFn } from "@/lib/yupai/api";
import { getDeviceId, writeHostToken } from "@/lib/yupai/client-session";
import { todayISO } from "@/lib/yupai/format";
import { WEIGHT_PRESETS } from "@/lib/yupai/matching";
import { MATCH_DURATIONS, type WeightPreset, type Weights } from "@/lib/yupai/types";
import { toast } from "sonner";

export function LandingPage() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [venueName, setVenueName] = useState("鄰里羽球場");
  const [sessionDate, setSessionDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("19:00");
  const [endTime, setEndTime] = useState("22:00");
  const [courtCount, setCourtCount] = useState(4);
  const [duration, setDuration] = useState(12);
  const [consecutive, setConsecutive] = useState(2);
  const [forceRest, setForceRest] = useState(true);
  const [preset, setPreset] = useState<WeightPreset>("fair");
  const [weights, setWeights] = useState<Weights>({ ...WEIGHT_PRESETS.fair });
  const [busy, setBusy] = useState(false);

  const goBoard = (code: string, token: string) => {
    writeHostToken(code, token);
    void navigate({ to: "/s/$code", params: { code } });
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-10 px-5 py-10 lg:py-16">
      <header className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <p className="text-sm tracking-[0.25em] text-primary">YUPAI</p>
          <h1 className="mt-2 font-display text-5xl leading-none tracking-tight lg:text-7xl">
            羽排
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            當日現場單打排點看板。團主用平板橫向改棋盤，球友手機只看自己的狀態。程度 1–18 級；下場記比分後實力會跟著動。
          </p>
        </div>
        <CourtHero />
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <form
          noValidate
          className="flex flex-col gap-4 rounded-xl bg-card p-5"
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            setBusy(true);
            try {
              const res = await createSessionFn({
                data: {
                  venueName,
                  sessionDate: sessionDate || todayISO(),
                  startTime: startTime || "19:00",
                  endTime: endTime || "22:00",
                  courtCount,
                  matchDurationMin: duration,
                  consecutiveLimit: consecutive,
                  forceRestAfterMatch: forceRest,
                  banRecentOpponent: false,
                  scoringEnabled: true,
                  weights,
                  weightPreset: preset,
                  deviceId: getDeviceId(),
                },
              });
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
          }}
        >
          <h2 className="text-lg font-semibold">建立今日場次</h2>
          <Field label="場館">
            <Input value={venueName} onChange={(e) => setVenueName(e.target.value)} />
          </Field>
          <Field label={`面數 ${courtCount}（一面兩人）`}>
            <CountPicker
              value={courtCount}
              min={1}
              max={6}
              ariaLabel="面數"
              onChange={setCourtCount}
            />
          </Field>
          <Field label="日期">
            <Input
              type="text"
              inputMode="numeric"
              placeholder="YYYY-MM-DD"
              value={sessionDate}
              onChange={(e) => setSessionDate(e.target.value)}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="開始">
              <TimeSelect value={startTime} onChange={setStartTime} />
            </Field>
            <Field label="結束">
              <TimeSelect value={endTime} onChange={setEndTime} />
            </Field>
          </div>
          <div>
            <Label>每場時長</Label>
            <div className="mt-2 flex flex-wrap gap-2">
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
          <Field label={`連續 ${consecutive} 場必須休息`}>
            <CountPicker
              value={consecutive}
              min={1}
              max={4}
              suffix=" 場"
              ariaLabel="連續幾場必須休息"
              onChange={setConsecutive}
            />
          </Field>
          <label className="flex items-center justify-between text-sm">
            下場後強制休息 1 輪
            <Switch checked={forceRest} onCheckedChange={setForceRest} />
          </label>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={preset === "fair" ? "default" : "secondary"}
              onClick={() => {
                setPreset("fair");
                setWeights({ ...WEIGHT_PRESETS.fair });
              }}
            >
              公平優先
            </Button>
            <Button
              type="button"
              size="sm"
              variant={preset === "intensity" ? "default" : "secondary"}
              onClick={() => {
                setPreset("intensity");
                setWeights({ ...WEIGHT_PRESETS.intensity });
              }}
            >
              強度優先
            </Button>
          </div>
          <Button type="submit" size="lg" disabled={busy}>
            {busy ? "開場中…" : "開場"}
          </Button>
        </form>

        <div className="flex flex-col gap-4">
          <form
            noValidate
            className="flex flex-col gap-3 rounded-xl bg-card p-5"
            onSubmit={(e) => {
              e.preventDefault();
              const code = joinCode.trim().toUpperCase();
              if (code.length < 4) return;
              void navigate({ to: "/s/$code", params: { code } });
            }}
          >
            <h2 className="text-lg font-semibold">加入場次</h2>
            <p className="text-sm text-muted-foreground">
              輸入場次碼。未持有主控密鑰的裝置預設只讀。
            </p>
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="例如 A3K7MQ"
              className="font-display tracking-[0.3em]"
              maxLength={8}
            />
            <Button type="submit" variant="secondary">
              進入看板
            </Button>
          </form>

          <div className="rounded-xl bg-card p-5">
            <h2 className="text-lg font-semibold">先看示範</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              4 面場、13 人單打。可直接拖名牌、先補順位再空場上場；下場時填比分，程度會依分差微調。
            </p>
            <Button
              className="mt-4"
              variant="outline"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const res = await createDemoFn({ data: { deviceId: getDeviceId() } });
                  goBoard(res.code, res.hostToken);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "無法開啟示範");
                } finally {
                  setBusy(false);
                }
              }}
            >
              開啟示範看板
            </Button>
          </div>

          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>程度用 1–18 級。下場填比分後會依分差微調實力，下一場配對跟著變。</li>
            <li>單打固定賽制，一面場兩人。開場時可選 1–6 面。</li>
            <li>自動配對先填上場順位，空場再依順位上場，不動正在打的人。</li>
            <li>不做訂場、報名、繳費或會員系統。</li>
          </ul>
        </div>
      </section>
    </main>
  );
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

function CourtHero() {
  return (
    <div
      aria-hidden
      className="relative aspect-[4/3] overflow-hidden rounded-xl bg-court"
    >
      <div className="absolute inset-4 border-2 border-line/80" />
      <div className="absolute top-4 bottom-4 left-1/2 w-0.5 -translate-x-1/2 bg-line/80" />
      <div className="absolute top-1/2 left-4 right-4 h-0.5 -translate-y-1/2 bg-line/40" />
      <div className="absolute top-[18%] left-[18%] rounded-lg bg-secondary px-3 py-2 text-sm">
        阿明
      </div>
      <div className="absolute right-[18%] bottom-[18%] rounded-lg bg-secondary px-3 py-2 text-sm">
        佳玲
      </div>
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-display text-3xl tabular text-line">
        8:12
      </p>
    </div>
  );
}
