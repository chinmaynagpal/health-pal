import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import FoodLog from "@/models/FoodLog";
import StepLog from "@/models/StepLog";
import WeightLog from "@/models/WeightLog";

function dayStart(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function GET(req) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const url = new URL(req.url);
  const range = url.searchParams.get("range") || "week"; // week | month
  const days = range === "month" ? 30 : 7;
  const since = dayStart();
  since.setDate(since.getDate() - (days - 1));

  const [foodLogs, steps, weights] = await Promise.all([
    FoodLog.find({ userId: uid, loggedAt: { $gte: since } }).lean(),
    StepLog.find({ userId: uid, date: { $gte: since } }).sort({ date: 1 }).lean(),
    WeightLog.find({ userId: uid, date: { $gte: since } }).sort({ date: 1 }).lean(),
  ]);

  // Calories per day
  const calMap = {};
  for (const f of foodLogs) {
    const k = dayStart(f.loggedAt).toISOString().slice(0, 10);
    calMap[k] = (calMap[k] || 0) + (f.totalCalories || 0);
  }
  const caloriesSeries = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const k = d.toISOString().slice(0, 10);
    caloriesSeries.push({ date: k, calories: calMap[k] || 0 });
  }

  return NextResponse.json({
    range,
    calories: caloriesSeries,
    steps: steps.map((s) => ({
      date: s.date.toISOString().slice(0, 10),
      steps: s.steps,
    })),
    weights: weights.map((w) => ({
      date: w.date.toISOString().slice(0, 10),
      weight: w.weightKg,
    })),
  });
}
