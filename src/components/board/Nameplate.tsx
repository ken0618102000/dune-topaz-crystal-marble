import { Lock, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatWait, stintWaitSec } from "@/lib/yupai/format";
import { formatSkill, skillBand, STATUS_LABELS, type Player } from "@/lib/yupai/types";

type Props = {
  player: Player;
  now: number;
  lastOpponentName?: string | null;
  dim?: boolean;
  onPointerDown?: (e: React.PointerEvent<HTMLButtonElement>) => void;
};

export function Nameplate({
  player,
  now,
  lastOpponentName,
  dim,
  onPointerDown,
}: Props) {
  const waiting =
    player.status === "rest" || player.status === "force_rest"
      ? stintWaitSec(player.lastWaitStart, now)
      : 0;
  const meta: string[] = [];
  if (player.status === "rest" || player.status === "force_rest") {
    meta.push(formatWait(waiting));
  }
  meta.push(`${player.playCount} 場`);
  if (lastOpponentName) meta.push(`上 ${lastOpponentName}`);
  const moved = Math.abs(player.skill - player.seedSkill) >= 0.15;

  return (
    <button
      type="button"
      data-player-id={player.id}
      className={cn(
        "nameplate flex min-h-12 min-w-28 flex-col items-start justify-center rounded-lg bg-secondary px-3 py-2 text-left",
        "border border-transparent transition-colors duration-150",
        "hover:border-primary/40 focus-visible:ring-2 focus-visible:ring-ring",
        player.status === "force_rest" && "opacity-80",
        player.locked && "border-warn/40",
        dim && "opacity-50",
      )}
      onPointerDown={onPointerDown}
    >
      <span className="flex w-full items-center gap-1.5">
        <span className="truncate text-base font-medium leading-tight">
          {player.nickname}
        </span>
        {player.locked ? <Lock className="size-3.5 shrink-0 text-warn" /> : null}
        {player.isDropIn ? (
          <span className="rounded-full bg-accent px-1.5 text-[10px] tracking-wide text-muted-foreground">
            臨
          </span>
        ) : null}
        {player.status === "force_rest" ? (
          <span className="rounded-full bg-warn/20 px-1.5 text-[10px] text-warn">
            {STATUS_LABELS.force_rest}
          </span>
        ) : null}
      </span>
      <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <SkillMark skill={player.skill} hot={moved} />
        {meta.length ? <span>· {meta.join(" · ")}</span> : null}
      </span>
    </button>
  );
}

export function SkillMark({ skill, hot }: { skill: number; hot?: boolean }) {
  const pct = Math.max(4, Math.min(100, (skill / 18) * 100));
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="relative h-1.5 w-10 overflow-hidden rounded-full bg-border"
        aria-hidden
      >
        <span
          className={cn("absolute inset-y-0 left-0 rounded-full bg-primary", hot && "bg-ok")}
          style={{ width: `${pct}%` }}
        />
      </span>
      <span className={cn("tabular", hot && "text-ok")}>
        {formatSkill(skill)} {skillBand(skill)}
      </span>
    </span>
  );
}

export function EmptySeat({ label }: { label: string }) {
  return (
    <div className="flex min-h-12 min-w-28 items-center justify-center rounded-lg border border-dashed border-border bg-background/40 px-3 text-sm text-muted-foreground">
      <UserRound className="mr-1.5 size-3.5" />
      {label}
    </div>
  );
}
