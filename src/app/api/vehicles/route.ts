import { NextResponse } from "next/server";
import { getFitmentVehicleCatalog } from "@/lib/catalog/fitmentIndex";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const catalog = await getFitmentVehicleCatalog();
    return NextResponse.json({ catalog });
  } catch (error) {
    console.error("[api/vehicles]", error);
    return NextResponse.json(
      { catalog: {}, error: "Failed to load vehicle options" },
      { status: 500 },
    );
  }
}
