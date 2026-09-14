import { useState } from "react";
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
import { parsePlayerCsv } from "@/lib/yupai/csv";
import { readFrequent } from "@/lib/yupai/client-session";
import { SKILL_LABELS, STATUS_LABELS, type Player } from "@/lib/yupai/types";
import type { BoardApi } from "@/hooks/use-board";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  api: BoardApi;
  players: Player[];
};

export function RosterSheet({ open, onOpenChange, api, players }: Props) {
  const [name, setName] = useState("");
  const [skill, setSkill] = useState(3);
  const [dropIn, setDropIn] = useState(false);
  const [csv, setCsv] = useState("");
  const frequent = readFrequent();
  const canEdit = api.canEdit;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto p-0">
        <SheetHeader>
          <SheetTitle>當日名單</SheetTitle>
          <SheetDescription>暱稱不可重複。臨打不會寫入常用名單。</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-6 p-6">
          {canEdit ? (
            <form
              className="flex flex-col gap-3 rounded-lg bg-secondary p-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim()) return;
                api.run({
                  type: "addPlayer",
                  nickname: name,
                  skill,
                  isDropIn: dropIn,
                });
                setName("");
              }}
            >
              <Label htmlFor="new-nick">新增球員</Label>
              <Input
                id="new-nick"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="暱稱"
                maxLength={16}
              />
              <div className="flex items-center justify-between gap-3">
                <Label>程度 {SKILL_LABELS[skill]}</Label>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={skill}
                  onChange={(e) => setSkill(Number(e.target.value))}
                  className="w-36 accent-primary"
                />
              </div>
              <label className="flex items-center justify-between gap-3 text-sm">
                臨打
                <Switch checked={dropIn} onCheckedChange={setDropIn} />
              </label>
              <Button type="submit">加入</Button>
              {frequent.length ? (
                <div>
                  <p className="mb-2 text-xs text-muted-foreground">常用名單</p>
                  <div className="flex flex-wrap gap-1.5">
                    {frequent
                      .filter((f) => !players.some((p) => p.nickname === f.nickname))
                      .map((f) => (
                        <button
                          key={f.nickname}
                          type="button"
                          className="rounded-full bg-accent px-3 py-1.5 text-sm"
                          onClick={() =>
                            api.run({
                              type: "addPlayer",
                              nickname: f.nickname,
                              skill: f.skill,
                              isDropIn: false,
                            })
                          }
                        >
                          {f.nickname}
                        </button>
                      ))}
                  </div>
                </div>
              ) : null}
            </form>
          ) : null}

          <div className="flex flex-col gap-2">
            {canEdit ? (
              <Button
                variant="secondary"
                onClick={() => api.run({ type: "checkInAll" })}
              >
                全部簽到
              </Button>
            ) : null}
            {players.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-secondary px-3 py-2"
              >
                <div>
                  <p className="font-medium">{p.nickname}</p>
                  <p className="text-xs text-muted-foreground">
                    {STATUS_LABELS[p.status]} · {SKILL_LABELS[p.skill]} · {p.playCount} 場
                    {p.isDropIn ? " · 臨打" : ""}
                  </p>
                </div>
                {canEdit ? (
                  <div className="flex gap-1">
                    {p.status === "not_arrived" ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          api.run({ type: "setStatus", playerId: p.id, status: "rest" })
                        }
                      >
                        簽到
                      </Button>
                    ) : null}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => api.run({ type: "removePlayer", playerId: p.id })}
                    >
                      刪
                    </Button>
                  </div>
                ) : null}
              </div>
            ))}
            {players.length === 0 ? (
              <p className="text-sm text-muted-foreground">還沒有球員。</p>
            ) : null}
          </div>

          {canEdit ? (
            <div className="flex flex-col gap-2">
              <Label htmlFor="csv">CSV 匯入（暱稱,程度,臨打）</Label>
              <textarea
                id="csv"
                value={csv}
                onChange={(e) => setCsv(e.target.value)}
                rows={5}
                className="w-full rounded-md border border-input bg-secondary p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder={"暱稱,程度,臨打\n阿明,3,0\n小美,4,1"}
              />
              <Button
                variant="secondary"
                onClick={() => {
                  const rows = parsePlayerCsv(csv);
                  if (!rows.length) return;
                  api.run({ type: "importPlayers", rows });
                  setCsv("");
                }}
              >
                匯入
              </Button>
            </div>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
