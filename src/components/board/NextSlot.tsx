import { EmptySeat, Nameplate } from "./Nameplate";
import { cn } from "@/lib/utils";
import type { Player } from "@/lib/yupai/types";

type Props = {
  courtNo: number;
  players: Player[];
  now: number;
  nameOf: (id: string) => string;
  highlight?: boolean;
  dropActive?: boolean;
  onPointerPlayer: (player: Player, e: React.PointerEvent<HTMLButtonElement>) => void;
};

export function NextSlot({
  courtNo,
  players,
  now,
  nameOf,
  highlight,
  dropActive,
  onPointerPlayer,
}: Props) {
  const a = players[0];
  const b = players[1];
  return (
    <div
      data-drop={`queue:${courtNo}`}
      className={cn(
        "flex min-w-48 flex-col gap-2 rounded-xl border bg-card p-3",
        highlight ? "border-primary" : "border-border",
        dropActive && "ring-2 ring-primary",
      )}
    >
      <p className="text-xs font-medium tracking-wide text-muted-foreground">
        順位 {courtNo}
        {highlight ? <span className="ml-2 text-primary">下一組上場</span> : null}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1" data-drop={a ? `seat:queue:${courtNo}:${a.id}` : `queue:${courtNo}`}>
          {a ? (
            <Nameplate
              player={a}
              now={now}
              lastOpponentName={a.lastOpponentId ? nameOf(a.lastOpponentId) : null}
              onPointerDown={(e) => onPointerPlayer(a, e)}
            />
          ) : (
            <EmptySeat label="等待" />
          )}
        </div>
        <p className="shrink-0 text-center text-[10px] tracking-[0.3em] text-muted-foreground">VS</p>
        <div className="min-w-0 flex-1" data-drop={b ? `seat:queue:${courtNo}:${b.id}` : `queue:${courtNo}`}>
          {b ? (
            <Nameplate
              player={b}
              now={now}
              lastOpponentName={b.lastOpponentId ? nameOf(b.lastOpponentId) : null}
              onPointerDown={(e) => onPointerPlayer(b, e)}
            />
          ) : (
            <EmptySeat label="等待" />
          )}
        </div>
      </div>
    </div>
  );
}