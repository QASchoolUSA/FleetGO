import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Revalidate secret not configured" }, { status: 503 });
  }

  const provided =
    request.headers.get("x-fleetgo-revalidate") ||
    new URL(request.url).searchParams.get("secret");

  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidatePath("/");
  revalidatePath("/shop");
  revalidateTag("catalog", "max");

  return NextResponse.json({ revalidated: true, now: Date.now() });
}
