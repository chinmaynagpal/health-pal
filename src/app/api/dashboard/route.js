import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import FoodLog from "@/models/FoodLog";
import StepLog from "@/models/StepLog";
import WeightLog from "@/models/WeightLog";

/**
 * Single endpoint that returns all dashboard data in one roundtrip.
 * Replaces 3 separate fetches: /foods/log, /steps, /weight
 */
export async function GET(req) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const thirtyDaysAgo = new Date(todayStart);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);

  const [foods, stepDoc, weights] = await Promise.all([
    FoodLog.find({ userId: uid, loggedAt: { $gte: todayStart } })
      .sort({ loggedAt: -1 })
      .select("items totalCalories imageUrl loggedAt")
      .lean(),
    StepLog.findOne({ userId: uid, date: todayStart })
      .select("steps")
      .lean(),
    WeightLog.find({ userId: uid, date: { $gte: thirtyDaysAgo } })
      .sort({ date: -1 })
      .limit(1)
      .select("weightKg")
      .lean(),
  ]);

  return NextResponse.json({
    foods,
    steps: stepDoc?.steps || 0,
    latestWeight: weights[0]?.weightKg || null,
  });
}
