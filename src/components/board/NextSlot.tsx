import { EmptySeat, Nameplate } from "./Nameplate";
import type { Player } from "@/lib/yupai/types";

type Props = {
  courtNo: number;
  players: Player[];
  now: number;
  nameOf: (id: string) => string;
  onPointerPlayer: (player: Player, e: React.PointerEvent<HTMLButtonElement>) => void;
};

export function NextSlot({
  courtNo,
  players,
  now,
  nameOf,
  onPointerPlayer,
}: Props) {
  const a = players[0];
  const b = players[1];
  return (
    <div
      data-drop={`queue:${courtNo}`}
      className="flex min-w-56 flex-col gap-2 rounded-xl border border-border bg-card p-3"
    >
      <p className="text-xs font-medium tracking-wide text-muted-foreground">
        順位 {courtNo}
      </p>
      <div className="flex flex-col gap-2" data-drop={a ? `seat:queue:${courtNo}:${a.id}` : `queue:${courtNo}`}>
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
      <p className="text-center text-[10px] tracking-[0.3em] text-muted-foreground">VS</p>
      <div className="flex flex-col gap-2" data-drop={b ? `seat:queue:${courtNo}:${b.id}` : `queue:${courtNo}`}>
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
  );
}
