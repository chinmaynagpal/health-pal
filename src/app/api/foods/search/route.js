import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { searchFoods } from "@/lib/indianFoodDb";

export const runtime = "nodejs";

export async function GET(req) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";

  const results = searchFoods(q).slice(0, 10).map((f) => ({
    name: f.name,
    calories_per_100g: f.calories_per_100g,
    default_weight: f.default_weight,
  }));

  return NextResponse.json({ results });
}
