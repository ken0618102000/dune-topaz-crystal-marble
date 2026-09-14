import { Pause, Play, Plus, Square } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatClock, remainingMatchMs } from "@/lib/yupai/format";
import type { Match, Player } from "@/lib/yupai/types";
import { Button } from "@/components/ui/button";
import { EmptySeat, Nameplate } from "./Nameplate";

type Props = {
  courtNo: number;
  players: Player[];
  match?: Match;
  now: number;
  nameOf: (id: string) => string;
  canEdit: boolean;
  scoringEnabled?: boolean;
  onEnd: () => void;
  onPause: () => void;
  onResume: () => void;
  onExtend: () => void;
  onPointerPlayer: (player: Player, e: React.PointerEvent<HTMLButtonElement>) => void;
};

export function CourtCard({
  courtNo,
  players,
  match,
  now,
  nameOf,
  canEdit,
  scoringEnabled,
  onEnd,
  onPause,
  onResume,
  onExtend,
  onPointerPlayer,
}: Props) {
  const remaining = match
    ? remainingMatchMs(
        match.startedAt,
        match.durationMin,
        match.extendedSec,
        match.pauseAccumulatedMs,
        match.pausedAt,
        now,
      )
    : null;
  const overtime = remaining != null && remaining <= 0 && players.length === 2;
  const paused = Boolean(match?.pausedAt);
  const a = players[0];
  const b = players[1];

  return (
    <section
      data-drop={`court:${courtNo}`}
      className={cn(
        "flex min-w-56 flex-col rounded-xl bg-court p-3",
        overtime && "court-overtime",
      )}
    >
      <header className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium tracking-wide text-line">
          第 {courtNo} 場
        </h3>
        {remaining != null && players.length === 2 ? (
          <p
            className={cn(
              "font-display tabular text-2xl leading-none tracking-tight",
              overtime ? "text-warn" : "text-foreground",
            )}
          >
            {formatClock(remaining / 1000)}
            {paused ? (
              <span className="ml-2 text-xs font-sans text-muted-foreground">暫停</span>
            ) : null}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            {players.length === 1 ? "人數不足" : "空場"}
          </p>
        )}
      </header>

      <div className="flex flex-1 flex-col gap-2">
        <div data-drop={a ? `seat:court:${courtNo}:${a.id}` : `court:${courtNo}`}>
          {a ? (
            <Nameplate
              player={a}
              now={now}
              lastOpponentName={a.lastOpponentId ? nameOf(a.lastOpponentId) : null}
              onPointerDown={(e) => onPointerPlayer(a, e)}
            />
          ) : (
            <EmptySeat label="空位" />
          )}
        </div>
        <p className="text-center text-xs tracking-[0.3em] text-line/70">VS</p>
        <div data-drop={b ? `seat:court:${courtNo}:${b.id}` : `court:${courtNo}`}>
          {b ? (
            <Nameplate
              player={b}
              now={now}
              lastOpponentName={b.lastOpponentId ? nameOf(b.lastOpponentId) : null}
              onPointerDown={(e) => onPointerPlayer(b, e)}
            />
          ) : (
            <EmptySeat label="空位" />
          )}
        </div>
      </div>

      {canEdit ? (
        <div className="mt-3 flex gap-1.5">
          <Button
            size="sm"
            className="flex-1"
            disabled={players.length !== 2}
            onClick={onEnd}
          >
            <Square className="size-3.5" />
            {scoringEnabled ? "記分下場" : "下場"}
          </Button>
          {match && !paused ? (
            <Button size="icon" variant="secondary" onClick={onPause} aria-label="暫停">
              <Pause className="size-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              variant="secondary"
              onClick={onResume}
              disabled={!match}
              aria-label="繼續"
            >
              <Play className="size-4" />
            </Button>
          )}
          <Button
            size="icon"
            variant="secondary"
            onClick={onExtend}
            disabled={!match}
            aria-label="延長兩分鐘"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      ) : null}
    </section>
  );
}
