import { createHmac, timingSafeEqual } from "node:crypto";
import {
  ADMIN_COOKIE,
  ADMIN_TTL_MS,
  adminCookieOptions,
  getAdminSecret,
} from "./sessionShared";

export { ADMIN_COOKIE, adminCookieOptions, getAdminSecret };

function signPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Create a signed session token: `expMs.sig` */
export function createAdminSessionToken(secret: string, now = Date.now()): string {
  const exp = String(now + ADMIN_TTL_MS);
  const sig = signPayload(exp, secret);
  return `${exp}.${sig}`;
}

export function verifyAdminSessionToken(
  token: string | undefined | null,
  secret: string,
  now = Date.now(),
): boolean {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  const expMs = Number(exp);
  if (!Number.isFinite(expMs) || expMs < now) return false;
  const expected = signPayload(exp, secret);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
