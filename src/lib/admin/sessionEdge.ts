import {
  bufferToBase64Url,
  getAdminSecret,
  timingSafeEqualString,
} from "./sessionShared";

export { getAdminSecret };

/** Edge-safe verify using Web Crypto (for middleware). */
export async function verifyAdminSessionTokenEdge(
  token: string | undefined | null,
  secret: string,
  now = Date.now(),
): Promise<boolean> {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig) return false;
  const expMs = Number(exp);
  if (!Number.isFinite(expMs) || expMs < now) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(exp));
  const expected = bufferToBase64Url(mac);
  return timingSafeEqualString(sig, expected);
}
