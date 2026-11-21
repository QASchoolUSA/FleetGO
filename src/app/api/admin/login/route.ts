import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminSessionToken,
  getAdminSecret,
} from "@/lib/admin/session";

export async function POST(request: Request) {
  const secret = getAdminSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "Admin is not configured." },
      { status: 503 },
    );
  }

  let password = "";
  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = (await request.json().catch(() => null)) as {
      password?: string;
    } | null;
    password = body?.password?.trim() ?? "";
  } else {
    const form = await request.formData().catch(() => null);
    password = String(form?.get("password") ?? "").trim();
  }

  if (!password || password !== secret) {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  const token = createAdminSessionToken(secret);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, adminCookieOptions());
  return res;
}
