import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useBoard } from "@/hooks/use-board";
import { useNow } from "@/hooks/use-now";
import { readSelfId, writeSelfId } from "@/lib/yupai/client-session";
import { formatClock, elapsedMatchMs, formatWait, currentWaitSec } from "@/lib/yupai/format";
import { formatSkill, formatSkillDelta, skillBand, STATUS_LABELS } from "@/lib/yupai/types";

export function PlayerStatusPage({ code }: { code: string }) {
  const api = useBoard(code);
  const now = useNow(250);
  const stored = readSelfId(code);
  const [picked, setPicked] = useState(stored);
  const board = api.board;
  const me = board?.players.find((p) => p.id === picked) ?? null;

  const opponent = useMemo(() => {
    if (!board || !me) return null;
    if (me.status === "on_court" || me.status === "queued") {
      return (
        board.players.find(
          (p) =>
            p.id !== me.id &&
            p.courtNo === me.courtNo &&
            p.status === me.status,
        ) ?? null
      );
    }
    return null;
  }, [board, me]);

  if (api.isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center text-muted-foreground">
        載入中…
      </main>
    );
  }
  if (!board) {
    return (
      <main className="flex min-h-dvh items-center justify-center p-6">
        找不到場次
      </main>
    );
  }

  if (!me) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-4 px-5 py-10">
        <p className="font-display text-3xl">羽排</p>
        <h1 className="text-xl font-semibold">你是誰？</h1>
        <p className="text-sm text-muted-foreground">
          選自己的暱稱。此頁只讀，不會改棋盤。
        </p>
        <div className="flex flex-col gap-2">
          {board.players.map((p) => (
            <Button
              key={p.id}
              variant="secondary"
              className="justify-between"
              onClick={() => {
                writeSelfId(code, p.id);
                setPicked(p.id);
              }}
            >
              {p.nickname}
              <span className="text-xs text-muted-foreground">
                {STATUS_LABELS[p.status]}
              </span>
            </Button>
          ))}
        </div>
        <Button variant="ghost" asChild>
          <Link to="/s/$code" params={{ code }}>
            看完整看板
          </Link>
        </Button>
      </main>
    );
  }

  const live =
    me.status === "on_court"
      ? board.matches.find((m) => m.status === "live" && m.courtNo === me.courtNo)
      : undefined;
  const elapsed = live
    ? elapsedMatchMs(live.startedAt, live.pauseAccumulatedMs, live.pausedAt, now)
    : null;
  const wait = currentWaitSec(me.lastWaitStart, me.waitTotalSec, now);

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-6 px-5 py-10">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs tracking-[0.25em] text-primary">YUPAI</p>
          <h1 className="mt-1 font-display text-4xl">{me.nickname}</h1>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setPicked(null);
          }}
        >
          換人
        </Button>
      </div>

      <section className="rounded-xl bg-court p-6 text-center">
        <p className="text-sm text-line">{STATUS_LABELS[me.status]}</p>
        {elapsed != null ? (
          <p className="mt-2 font-display text-6xl tabular leading-none">
            {formatClock(elapsed / 1000)}
          </p>
        ) : me.status === "queued" ? (
          <p className="mt-2 text-lg">上場順位 {me.courtNo}</p>
        ) : (
          <p className="mt-2 text-lg text-muted-foreground">已等 {formatWait(wait)}</p>
        )}
        <p className="mt-4 text-sm">
          {opponent ? `對手 ${opponent.nickname}` : "尚無對手"}
        </p>
      </section>

      <dl className="grid grid-cols-2 gap-3">
        <Stat label="已打" value={`${me.playCount} 場`} />
        <Stat label="輪空" value={`${me.byeCount} 次`} />
        <Stat
          label="程度"
          value={`${formatSkill(me.skill)} ${skillBand(me.skill)}`}
        />
        <Stat
          label="今日升降"
          value={formatSkillDelta(me.skill - me.seedSkill)}
        />
        <Stat
          label="場號"
          value={
            me.status === "queued" && me.courtNo
              ? `順位 ${me.courtNo}`
              : me.courtNo
                ? `第 ${me.courtNo} 場`
                : "—"
          }
        />
        <Stat
          label="鎖定"
          value={me.locked ? "不排" : "可排"}
        />
      </dl>

      <Button variant="secondary" asChild>
        <Link to="/s/$code" params={{ code }}>
          看完整看板
        </Link>
      </Button>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-card px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-lg font-medium">{value}</dd>
    </div>
  );
}
