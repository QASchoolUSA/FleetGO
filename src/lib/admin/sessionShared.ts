export const ADMIN_COOKIE = "fleetgo_admin_session";
export const ADMIN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function getAdminSecret(): string | null {
  const secret = process.env.ADMIN_SECRET?.trim();
  return secret ? secret : null;
}

export function adminCookieOptions(maxAgeSeconds = Math.floor(ADMIN_TTL_MS / 1000)) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function timingSafeEqualString(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export function bufferToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
