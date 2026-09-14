import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useBoard } from "@/hooks/use-board";
import { useNow } from "@/hooks/use-now";
import { downloadCsv, toCsv } from "@/lib/yupai/csv";
import { currentWaitSec, formatMinutes, formatWait } from "@/lib/yupai/format";
import { formatSkill, formatSkillDelta, skillBand } from "@/lib/yupai/types";

export function ReportPage({ code }: { code: string }) {
  const api = useBoard(code);
  const now = useNow(1000);
  const board = api.board;

  if (api.isLoading || !board) {
    return (
      <main className="flex min-h-dvh items-center justify-center text-muted-foreground">
        報表載入中…
      </main>
    );
  }

  const completed = board.matches.filter((m) => m.status === "completed");
  const active = board.players.filter((p) => p.status !== "not_arrived");
  const plays = active.map((p) => p.playCount);
  const playGap = plays.length ? Math.max(...plays) - Math.min(...plays) : 0;
  const waits = active.map((p) =>
    currentWaitSec(p.lastWaitStart, p.waitTotalSec, now),
  );
  const longestWait = waits.length ? Math.max(...waits) : 0;
  const movers = board.players
    .map((p) => ({ ...p, delta: p.skill - (p.seedSkill ?? p.skill) }))
    .sort((a, b) => b.delta - a.delta);
  const topMover = movers[0];

  const opponentNames = (id: string) => {
    const names = new Set<string>();
    for (const m of completed) {
      if (m.playerAId === id) {
        const n = board.players.find((p) => p.id === m.playerBId)?.nickname;
        if (n) names.add(n);
      }
      if (m.playerBId === id) {
        const n = board.players.find((p) => p.id === m.playerAId)?.nickname;
        if (n) names.add(n);
      }
    }
    return [...names];
  };

  const exportCsv = () => {
    const playerRows = [
      ["暱稱", "開場程度", "目前程度", "升降", "上場次數", "總打分鐘", "等待分鐘", "輪空", "對手"],
      ...board.players.map((p) => [
        p.nickname,
        formatSkill(p.seedSkill ?? p.skill),
        formatSkill(p.skill),
        formatSkillDelta(p.skill - (p.seedSkill ?? p.skill)),
        String(p.playCount),
        String(Math.round(p.playTotalSec / 60)),
        String(Math.round(currentWaitSec(p.lastWaitStart, p.waitTotalSec, now) / 60)),
        String(p.byeCount),
        opponentNames(p.id).join(" / "),
      ]),
    ];
    const matchRows = [
      [],
      ["場號", "球員A", "球員B", "比分", "開始", "結束", "來源", "勝方"],
      ...completed.map((m) => [
        String(m.courtNo),
        board.players.find((p) => p.id === m.playerAId)?.nickname ?? "",
        board.players.find((p) => p.id === m.playerBId)?.nickname ?? "",
        m.scoreA != null && m.scoreB != null ? `${m.scoreA}-${m.scoreB}` : "",
        m.startedAt ?? "",
        m.endedAt ?? "",
        m.source === "auto" ? "自動" : "手動",
        m.winnerId
          ? (board.players.find((p) => p.id === m.winnerId)?.nickname ?? "")
          : "",
      ]),
    ];
    downloadCsv(
      `yupai-${board.session.code}.csv`,
      toCsv([...playerRows, ...matchRows]),
    );
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-4xl flex-col gap-6 px-5 py-8">
      <header className="flex flex-wrap items-center gap-3">
        <div>
          <p className="font-display text-2xl">當日報表</p>
          <p className="text-sm text-muted-foreground">
            {board.session.venueName} · {board.session.code}
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="secondary" onClick={exportCsv}>
            匯出 CSV
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/s/$code" params={{ code }}>
              回看板
            </Link>
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="上場次數差" value={String(playGap)} hint="愈小愈公平" />
        <Tile label="最長等待" value={formatWait(longestWait)} />
        <Tile label="完成場次" value={String(completed.length)} />
        <Tile
          label="程度升最多"
          value={
            topMover && topMover.delta > 0.05
              ? `${topMover.nickname} ${formatSkillDelta(topMover.delta)}`
              : "—"
          }
        />
      </section>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">暱稱</th>
              <th className="px-3 py-2 font-medium">程度</th>
              <th className="px-3 py-2 font-medium">升降</th>
              <th className="px-3 py-2 font-medium">上場</th>
              <th className="px-3 py-2 font-medium">打過</th>
              <th className="px-3 py-2 font-medium">等待</th>
              <th className="px-3 py-2 font-medium">輪空</th>
              <th className="px-3 py-2 font-medium">對手</th>
            </tr>
          </thead>
          <tbody>
            {board.players.map((p) => {
              const delta = p.skill - (p.seedSkill ?? p.skill);
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="px-3 py-2">{p.nickname}</td>
                  <td className="tabular px-3 py-2">
                    {formatSkill(p.skill)} {skillBand(p.skill)}
                  </td>
                  <td className="tabular px-3 py-2">{formatSkillDelta(delta)}</td>
                  <td className="tabular px-3 py-2">{p.playCount}</td>
                  <td className="tabular px-3 py-2">{formatMinutes(p.playTotalSec)}</td>
                  <td className="tabular px-3 py-2">
                    {formatWait(currentWaitSec(p.lastWaitStart, p.waitTotalSec, now))}
                  </td>
                  <td className="tabular px-3 py-2">{p.byeCount}</td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {opponentNames(p.id).join("、") || "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">場</th>
              <th className="px-3 py-2 font-medium">對戰</th>
              <th className="px-3 py-2 font-medium">比分</th>
              <th className="px-3 py-2 font-medium">勝方</th>
            </tr>
          </thead>
          <tbody>
            {completed.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-muted-foreground" colSpan={4}>
                  還沒有完成的場次。下場時填比分會出現在這裡。
                </td>
              </tr>
            ) : (
              completed.map((m) => {
                const na = board.players.find((p) => p.id === m.playerAId)?.nickname ?? "—";
                const nb = board.players.find((p) => p.id === m.playerBId)?.nickname ?? "—";
                const win = m.winnerId
                  ? board.players.find((p) => p.id === m.winnerId)?.nickname ?? "—"
                  : "—";
                return (
                  <tr key={m.id} className="border-t border-border">
                    <td className="tabular px-3 py-2">{m.courtNo}</td>
                    <td className="px-3 py-2">
                      {na} vs {nb}
                    </td>
                    <td className="tabular px-3 py-2">
                      {m.scoreA != null && m.scoreB != null ? `${m.scoreA}–${m.scoreB}` : "未記"}
                    </td>
                    <td className="px-3 py-2">{win}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}

function Tile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl tabular">{value}</p>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
