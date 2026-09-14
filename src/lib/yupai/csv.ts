import { clampSkill, SKILL_DEFAULT } from "./types.ts";

export type CsvPlayerRow = {
  nickname: string;
  skill: number;
  isDropIn: boolean;
};

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (q) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        q = false;
      } else {
        cur += ch;
      }
    } else if (ch === '"') {
      q = true;
    } else if (ch === ",") {
      out.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur.trim());
  return out;
}

export function parsePlayerCsv(text: string): CsvPlayerRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return [];
  const rows: CsvPlayerRow[] = [];
  const start = /暱稱|nickname|name/i.test(lines[0]!) ? 1 : 0;
  for (let i = start; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]!);
    const nickname = (cols[0] ?? "").trim();
    if (!nickname) continue;
    const skillRaw = Number(cols[1] ?? SKILL_DEFAULT);
    const skill = Number.isFinite(skillRaw) ? clampSkill(skillRaw) : SKILL_DEFAULT;
    const flag = (cols[2] ?? "").trim();
    const isDropIn = flag === "1" || flag === "true" || flag === "是" || flag === "臨打";
    rows.push({ nickname, skill, isDropIn });
  }
  return rows;
}

export function toCsv(rows: string[][]): string {
  return rows
    .map((r) =>
      r
        .map((cell) => {
          if (/[",\n]/.test(cell)) return `"${cell.replaceAll('"', '""')}"`;
          return cell;
        })
        .join(","),
    )
    .join("\n");
}

export function downloadCsv(filename: string, content: string) {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
