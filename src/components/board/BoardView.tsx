import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ClipboardCopy,
  RotateCcw,
  Shuffle,
  Sparkles,
  Users,
  Settings,
  BarChart3,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useBoard } from "@/hooks/use-board";
import { useNow } from "@/hooks/use-now";
import { rememberPlayers } from "@/lib/yupai/client-session";
import { currentWaitSec, formatClock, formatDateLabel } from "@/lib/yupai/format";
import { STATUS_LABELS, type Player, type PlayerStatus } from "@/lib/yupai/types";
import { CourtCard } from "./CourtCard";
import { Nameplate } from "./Nameplate";
import { NextSlot } from "./NextSlot";
import { RosterSheet } from "./RosterSheet";
import { SettingsSheet } from "./SettingsSheet";

type Drag = {
  ids: string[];
  label: string;
  x: number;
  y: number;
};

function parseDrop(raw: string | null):
  | { zone: "rest" }
  | { zone: "court"; courtNo: number; replacePlayerId?: string }
  | { zone: "queue"; courtNo: number; replacePlayerId?: string }
  | null {
  if (!raw) return null;
  if (raw === "rest") return { zone: "rest" };
  const court = /^court:(\d+)$/.exec(raw);
  if (court) return { zone: "court", courtNo: Number(court[1]) };
  const queue = /^queue:(\d+)$/.exec(raw);
  if (queue) return { zone: "queue", courtNo: Number(queue[1]) };
  const seatC = /^seat:court:(\d+):(.+)$/.exec(raw);
  if (seatC) {
    return {
      zone: "court",
      courtNo: Number(seatC[1]),
      replacePlayerId: seatC[2],
    };
  }
  const seatQ = /^seat:queue:(\d+):(.+)$/.exec(raw);
  if (seatQ) {
    return {
      zone: "queue",
      courtNo: Number(seatQ[1]),
      replacePlayerId: seatQ[2],
    };
  }
  return null;
}

function dropFromPoint(x: number, y: number) {
  const el = document.elementFromPoint(x, y);
  const node = el?.closest("[data-drop]") as HTMLElement | null;
  return parseDrop(node?.dataset.drop ?? null);
}

export function BoardView({ code }: { code: string }) {
  const api = useBoard(code);
  const now = useNow(250);
  const board = api.board;
  const [rosterOpen, setRosterOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuPlayer, setMenuPlayer] = useState<Player | null>(null);
  const [pickMode, setPickMode] = useState<null | "preferred" | "blacklist">(null);
  const [scoreCourt, setScoreCourt] = useState<number | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const longPress = useRef<number | null>(null);
  const dragging = useRef(false);
  const startPt = useRef({ x: 0, y: 0, ids: [] as string[] });

  useEffect(() => {
    if (board?.session.status === "ended") {
      rememberPlayers(
        board.players.map((p) => ({
          nickname: p.nickname,
          skill: p.skill,
          isDropIn: p.isDropIn,
        })),
      );
    }
  }, [board?.session.status, board?.players]);

  const nameOf = useMemo(() => {
    const map = new Map(board?.players.map((p) => [p.id, p.nickname]) ?? []);
    return (id: string) => map.get(id) ?? "—";
  }, [board?.players]);

  const clearTimer = () => {
    if (longPress.current) {
      window.clearTimeout(longPress.current);
      longPress.current = null;
    }
  };

  const beginPointer = (
    ids: string[],
    label: string,
    e: React.PointerEvent,
  ) => {
    if (!api.canEdit) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    dragging.current = false;
    startPt.current = { x: e.clientX, y: e.clientY, ids };
    const player = board?.players.find((p) => p.id === ids[0]);
    clearTimer();
    longPress.current = window.setTimeout(() => {
      if (!dragging.current && player && ids.length === 1) {
        setMenuPlayer(player);
        setDrag(null);
      }
    }, 420);
    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startPt.current.x;
      const dy = ev.clientY - startPt.current.y;
      if (!dragging.current && Math.hypot(dx, dy) > 10) {
        dragging.current = true;
        clearTimer();
      }
      if (dragging.current) {
        setDrag({ ids, label, x: ev.clientX, y: ev.clientY });
      }
    };
    const up = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      clearTimer();
      const wasDrag = dragging.current;
      dragging.current = false;
      setDrag(null);
      if (!wasDrag) return;
      const dest = dropFromPoint(ev.clientX, ev.clientY);
      if (!dest) return;
      api.run({ type: "move", playerIds: ids, dest });
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  if (api.isLoading) {
    return (
      <main className="flex min-h-dvh items-center justify-center text-muted-foreground">
        看板載入中…
      </main>
    );
  }
  if (api.error || !board) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center gap-3 p-6">
        <p>{api.error?.message ?? "找不到這個場次"}</p>
        <Button asChild variant="secondary">
          <Link to="/">回首頁</Link>
        </Button>
      </main>
    );
  }

  const session = board.session;
  const courts = Array.from({ length: session.courtCount }, (_, i) => i + 1);
  const rest = board.players
    .filter((p) => p.status === "rest" || p.status === "force_rest")
    .sort(
      (a, b) =>
        currentWaitSec(b.lastWaitStart, b.waitTotalSec, now) -
        currentWaitSec(a.lastWaitStart, a.waitTotalSec, now),
    );
  const sideline = board.players.filter(
    (p) => p.status === "not_arrived" || p.status === "left",
  );
  const endMs = Date.parse(`${session.sessionDate}T${session.endTime}:00`);
  const remainSession = Number.isFinite(endMs) ? (endMs - now) / 1000 : 0;

  const requestEnd = (courtNo: number) => {
    if (session.scoringEnabled) setScoreCourt(courtNo);
    else api.run({ type: "endMatch", courtNo });
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

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 px-3 py-2 backdrop-blur-sm lg:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/" className="font-display text-lg tracking-tight">
            羽排
          </Link>
          <span className="text-muted-foreground">/</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {session.venueName} · {formatDateLabel(session.sessionDate)}
            </p>
            <p className="tabular text-xs text-muted-foreground">
              {session.startTime}–{session.endTime}
              {Number.isFinite(endMs) ? ` · 剩餘 ${formatClock(remainSession)}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={copyCode}
            className="ml-auto inline-flex min-h-11 items-center gap-1 rounded-md bg-secondary px-3 font-display text-sm tracking-widest"
          >
            {session.code}
            <ClipboardCopy className="size-3.5" />
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Button
            size="sm"
            disabled={!api.canEdit}
            onClick={() => api.run({ type: "fillNext" })}
          >
            <Sparkles className="size-3.5" />
            排下一場
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={!api.canEdit}
            onClick={() => api.run({ type: "reshuffleNext" })}
          >
            <Shuffle className="size-3.5" />
            全部重排
          </Button>
          <Button
            size="sm"
            variant="secondary"
            disabled={!api.canUndo}
            onClick={() => api.undo()}
          >
            <RotateCcw className="size-3.5" />
            撤銷
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setRosterOpen(true)}>
            <Users className="size-3.5" />
            名單
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link to="/s/$code/report" params={{ code: session.code }}>
              <BarChart3 className="size-3.5" />
              報表
            </Link>
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSettingsOpen(true)}>
            <Settings className="size-3.5" />
            設定
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link to="/s/$code/me" params={{ code: session.code }}>
              <Smartphone className="size-3.5" />
              我的狀態
            </Link>
          </Button>
        </div>
      </header>

      {!api.canEdit ? (
        <div className="bg-accent px-4 py-2 text-sm text-accent-foreground">
          {session.status === "ended"
            ? "場次已結束，看板只讀。"
            : board.isHost
              ? "主控在另一台裝置。可在設定取得主控。"
              : "目前為只讀看板。球友請開「我的狀態」；團主請在設定貼上主控密鑰。"}
        </div>
      ) : null}

      <main className="flex flex-1 flex-col gap-4 p-3 lg:p-5">
        <section>
          <h2 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">
            場上
          </h2>
          <div className="flex snap-x gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible">
            {courts.map((no) => {
              const on = board.players.filter(
                (p) => p.status === "on_court" && p.courtNo === no,
              );
              const match = board.matches.find(
                (m) => m.status === "live" && m.courtNo === no,
              );
              return (
                <div key={no} className="w-64 shrink-0 snap-start lg:w-auto">
                  <CourtCard
                    courtNo={no}
                    players={on}
                    match={match}
                    now={now}
                    nameOf={nameOf}
                    canEdit={api.canEdit}
                    onEnd={() => requestEnd(no)}
                    onPause={() => api.run({ type: "pauseMatch", courtNo: no })}
                    onResume={() => api.run({ type: "resumeMatch", courtNo: no })}
                    onExtend={() =>
                      api.run({ type: "extendMatch", courtNo: no, extraSec: 120 })
                    }
                    onPointerPlayer={(p, e) => beginPointer([p.id], p.nickname, e)}
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">
            下一場
          </h2>
          <div className="flex snap-x gap-3 overflow-x-auto pb-2 lg:grid lg:grid-cols-4 lg:overflow-visible">
            {courts.map((no) => {
              const queued = board.players.filter(
                (p) => p.status === "queued" && p.courtNo === no,
              );
              return (
                <div key={no} className="w-64 shrink-0 snap-start lg:w-auto">
                  <NextSlot
                    courtNo={no}
                    players={queued}
                    now={now}
                    nameOf={nameOf}
                    onPointerPlayer={(p, e) => beginPointer([p.id], p.nickname, e)}
                    onPointerPair={(e) =>
                      beginPointer(
                        queued.map((p) => p.id),
                        queued.map((p) => p.nickname).join(" vs "),
                        e,
                      )
                    }
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section
          data-drop="rest"
          className="min-h-36 rounded-xl border border-dashed border-border bg-card/60 p-3"
        >
          <h2 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground">
            休息區
          </h2>
          <div className="flex flex-wrap gap-2">
            {rest.map((p) => (
              <Nameplate
                key={p.id}
                player={p}
                now={now}
                lastOpponentName={p.lastOpponentId ? nameOf(p.lastOpponentId) : null}
                onPointerDown={(e) => beginPointer([p.id], p.nickname, e)}
              />
            ))}
            {rest.length === 0 ? (
              <p className="text-sm text-muted-foreground">休息區是空的。</p>
            ) : null}
          </div>
          {sideline.length ? (
            <div className="mt-4">
              <h3 className="mb-2 text-xs text-muted-foreground">未到 / 離場</h3>
              <div className="flex flex-wrap gap-2">
                {sideline.map((p) => (
                  <Nameplate
                    key={p.id}
                    player={p}
                    now={now}
                    dim
                    onPointerDown={(e) => beginPointer([p.id], p.nickname, e)}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </main>

      {drag ? (
        <div
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow-lg"
          style={{ left: drag.x, top: drag.y }}
        >
          {drag.label}
        </div>
      ) : null}

      <RosterSheet
        open={rosterOpen}
        onOpenChange={setRosterOpen}
        api={api}
        players={board.players}
      />
      <SettingsSheet
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        api={api}
        session={session}
      />

      <Sheet open={Boolean(menuPlayer)} onOpenChange={() => { setMenuPlayer(null); setPickMode(null); }}>
        <SheetContent side="bottom" className="p-0">
          <SheetHeader>
            <SheetTitle>{menuPlayer?.nickname}</SheetTitle>
          </SheetHeader>
          {menuPlayer && !pickMode ? (
            <div className="grid grid-cols-2 gap-2 p-6 pt-2">
              {(
                [
                  ["rest", "休息"],
                  ["force_rest", "強制休息"],
                  ["not_arrived", "未到"],
                  ["left", "離場"],
                ] as const
              ).map(([status, label]) => (
                <Button
                  key={status}
                  variant="secondary"
                  onClick={() => {
                    api.run({
                      type: "setStatus",
                      playerId: menuPlayer.id,
                      status: status as PlayerStatus,
                    });
                    setMenuPlayer(null);
                  }}
                >
                  {label}
                </Button>
              ))}
              <Button
                variant="secondary"
                onClick={() => {
                  api.run({
                    type: "setLocked",
                    playerId: menuPlayer.id,
                    locked: !menuPlayer.locked,
                  });
                  setMenuPlayer(null);
                }}
              >
                {menuPlayer.locked ? "解除鎖定" : "鎖定不排"}
              </Button>
              <Button variant="secondary" onClick={() => setPickMode("preferred")}>
                指定對戰
              </Button>
              <Button variant="secondary" onClick={() => setPickMode("blacklist")}>
                不要同場
              </Button>
              <p className="col-span-2 text-xs text-muted-foreground">
                {STATUS_LABELS[menuPlayer.status]} · 已打 {menuPlayer.playCount} 場 · 輪空{" "}
                {menuPlayer.byeCount}
              </p>
            </div>
          ) : menuPlayer && pickMode ? (
            <div className="flex flex-col gap-2 p-6 pt-2">
              <p className="text-sm text-muted-foreground">
                {pickMode === "preferred" ? "選一位優先對戰" : "選一位永不排在一起"}
              </p>
              {board.players
                .filter((p) => p.id !== menuPlayer.id)
                .map((p) => (
                  <Button
                    key={p.id}
                    variant="outline"
                    onClick={() => {
                      api.run({
                        type: "addRestriction",
                        kind: pickMode,
                        playerAId: menuPlayer.id,
                        playerBId: p.id,
                      });
                      setMenuPlayer(null);
                      setPickMode(null);
                    }}
                  >
                    {p.nickname}
                  </Button>
                ))}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <ScoreDialog
        open={scoreCourt != null}
        courtNo={scoreCourt}
        players={
          scoreCourt
            ? board.players.filter(
                (p) => p.status === "on_court" && p.courtNo === scoreCourt,
              )
            : []
        }
        onClose={() => setScoreCourt(null)}
        onSubmit={(payload) => {
          if (scoreCourt == null) return;
          api.run({ type: "endMatch", courtNo: scoreCourt, ...payload });
          setScoreCourt(null);
        }}
      />
    </div>
  );
}

function ScoreDialog({
  open,
  courtNo,
  players,
  onClose,
  onSubmit,
}: {
  open: boolean;
  courtNo: number | null;
  players: Player[];
  onClose: () => void;
  onSubmit: (p: { winnerId?: string | null; scoreA?: number | null; scoreB?: number | null }) => void;
}) {
  const [winner, setWinner] = useState<string | null>(null);
  const a = players[0];
  const b = players[1];
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>第 {courtNo} 場結果</DialogTitle>
          <DialogDescription>可只記勝負，也可略過。</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          {a ? (
            <Button
              variant={winner === a.id ? "default" : "secondary"}
              className="flex-1"
              onClick={() => setWinner(a.id)}
            >
              {a.nickname} 勝
            </Button>
          ) : null}
          {b ? (
            <Button
              variant={winner === b.id ? "default" : "secondary"}
              className="flex-1"
              onClick={() => setWinner(b.id)}
            >
              {b.nickname} 勝
            </Button>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onSubmit({})}>
            略過
          </Button>
          <Button onClick={() => onSubmit({ winnerId: winner })}>下場</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
