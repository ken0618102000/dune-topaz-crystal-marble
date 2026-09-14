import { useEffect, useMemo, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { applyMatchRating, expectedScore } from "@/lib/yupai/rating";
import { formatSkill, formatSkillDelta, skillBand, type Player } from "@/lib/yupai/types";
import { cn } from "@/lib/utils";

type Payload = {
  winnerId?: string | null;
  scoreA?: number | null;
  scoreB?: number | null;
};

const SCORE_MAX = 30;

export function ScoreDialog({
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
  onSubmit: (p: Payload) => void;
}) {
  const a = players[0];
  const b = players[1];
  const [scoreA, setScoreA] = useState("");
  const [scoreB, setScoreB] = useState("");
  const [winner, setWinner] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setScoreA("");
    setScoreB("");
    setWinner(null);
  }, [open, courtNo, a?.id, b?.id]);

  const nA = scoreA === "" ? null : Number(scoreA);
  const nB = scoreB === "" ? null : Number(scoreB);
  const validA = nA != null && Number.isFinite(nA) && nA >= 0;
  const validB = nB != null && Number.isFinite(nB) && nB >= 0;

  useEffect(() => {
    if (!a || !b || !validA || !validB || nA === nB) return;
    setWinner(nA! > nB! ? a.id : b.id);
  }, [a, b, validA, validB, nA, nB]);

  const preview = useMemo(() => {
    if (!a || !b) return null;
    const win = winner === a.id ? "a" : winner === b.id ? "b" : null;
    return applyMatchRating({
      skillA: a.skill,
      skillB: b.skill,
      scoreA: validA ? nA : null,
      scoreB: validB ? nB : null,
      winner: win,
    });
  }, [a, b, winner, validA, validB, nA, nB]);

  const expected = a && b ? expectedScore(a.skill, b.skill) : 0.5;

  const submit = (skip: boolean) => {
    if (skip) {
      onSubmit({});
      return;
    }
    onSubmit({
      winnerId: winner,
      scoreA: validA ? nA : null,
      scoreB: validB ? nB : null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-[min(100%-1.5rem,40rem)]">
        <DialogHeader>
          <DialogTitle>第 {courtNo} 場比分</DialogTitle>
          <DialogDescription>
            記下分數後，程度會依勝負與分差微調。也可只點勝者。
          </DialogDescription>
        </DialogHeader>

        {a && b ? (
          <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
            <ScoreSide
              name={a.nickname}
              skill={a.skill}
              value={scoreA}
              onChange={setScoreA}
              win={winner === a.id}
              onWin={() => setWinner(a.id)}
              delta={preview?.deltaA ?? null}
              nextSkill={preview?.skillA ?? null}
            />
            <p className="mt-14 text-sm tracking-[0.3em] text-muted-foreground">VS</p>
            <ScoreSide
              name={b.nickname}
              skill={b.skill}
              value={scoreB}
              onChange={setScoreB}
              win={winner === b.id}
              onWin={() => setWinner(b.id)}
              delta={preview?.deltaB ?? null}
              nextSkill={preview?.skillB ?? null}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">這面場人數不足。</p>
        )}

        {a && b ? (
          <p className="text-xs text-muted-foreground">
            依目前程度，
            {expected >= 0.55 ? a.nickname : expected <= 0.45 ? b.nickname : "雙方"}
            {expected >= 0.55 || expected <= 0.45 ? "較占上風" : "接近"}
            {preview
              ? "。爆冷升得較多，熱門贏球幾乎不動。"
              : " · 填比分或點勝者後才會調程度"}
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="ghost" onClick={() => submit(true)}>
            略過
          </Button>
          <Button onClick={() => submit(false)} disabled={!a || !b}>
            記下並下場
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ScoreSide({
  name,
  skill,
  value,
  onChange,
  win,
  onWin,
  delta,
  nextSkill,
}: {
  name: string;
  skill: number;
  value: string;
  onChange: (v: string) => void;
  win: boolean;
  onWin: () => void;
  delta: number | null;
  nextSkill: number | null;
}) {
  const n = value === "" ? 0 : Number(value);
  const bump = (d: number) => {
    const next = Math.max(0, Math.min(SCORE_MAX, (Number.isFinite(n) ? n : 0) + d));
    onChange(String(next));
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="truncate text-sm font-medium">{name}</p>
      <p className="text-xs text-muted-foreground">
        {formatSkill(skill)} {skillBand(skill)}
      </p>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          size="icon"
          variant="secondary"
          onClick={() => bump(-1)}
          aria-label={`${name} 減一分`}
        >
          <Minus className="size-4" />
        </Button>
        <Input
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, "").slice(0, 2))}
          placeholder="0"
          className="h-16 text-center font-display text-3xl tabular"
          aria-label={`${name} 得分`}
        />
        <Button
          type="button"
          size="icon"
          variant="secondary"
          onClick={() => bump(1)}
          aria-label={`${name} 加一分`}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      <Button type="button" variant={win ? "default" : "secondary"} onClick={onWin}>
        {name} 勝
      </Button>
      {delta != null && nextSkill != null ? (
        <p
          className={cn(
            "text-center text-xs tabular",
            delta > 0.05 ? "text-ok" : delta < -0.05 ? "text-warn" : "text-muted-foreground",
          )}
        >
          → {formatSkill(nextSkill)}（{formatSkillDelta(delta)}）
        </p>
      ) : (
        <p className="text-center text-xs text-muted-foreground">尚未記入</p>
      )}
    </div>
  );
}
