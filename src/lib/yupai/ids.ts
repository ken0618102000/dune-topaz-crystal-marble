const CODE_ALPH = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function newId(): string {
  return crypto.randomUUID();
}

export function sessionCode(len = 6): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  let out = "";
  for (const b of bytes) out += CODE_ALPH[b % CODE_ALPH.length];
  return out;
}

export function hostToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function transferPin(): string {
  return sessionCode(6);
}
