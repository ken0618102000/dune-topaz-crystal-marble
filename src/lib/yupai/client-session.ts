const DEVICE_KEY = "yupai:device";

export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function hostTokenKey(code: string) {
  return `yupai:host:${code.toUpperCase()}`;
}

export function readHostToken(code: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(hostTokenKey(code));
}

export function writeHostToken(code: string, token: string) {
  localStorage.setItem(hostTokenKey(code), token);
}

export function clearHostToken(code: string) {
  localStorage.removeItem(hostTokenKey(code));
}

export type FrequentPlayer = { nickname: string; skill: number };

export function readFrequent(): FrequentPlayer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("yupai:frequent");
    if (!raw) return [];
    const parsed = JSON.parse(raw) as FrequentPlayer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeFrequent(list: FrequentPlayer[]) {
  localStorage.setItem("yupai:frequent", JSON.stringify(list.slice(0, 80)));
}

export function rememberPlayers(
  players: Array<{ nickname: string; skill: number; isDropIn: boolean }>,
) {
  const current = readFrequent();
  const map = new Map(current.map((p) => [p.nickname, p]));
  for (const p of players) {
    if (p.isDropIn) map.delete(p.nickname);
    else map.set(p.nickname, { nickname: p.nickname, skill: p.skill });
  }
  writeFrequent([...map.values()]);
}

export function selfKey(code: string) {
  return `yupai:self:${code.toUpperCase()}`;
}

export function readSelfId(code: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(selfKey(code));
}

export function writeSelfId(code: string, playerId: string) {
  localStorage.setItem(selfKey(code), playerId);
}
