import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import WeightLog from "@/models/WeightLog";
import User from "@/models/User";

function dayStart(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function POST(req) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { weightKg, date } = await req.json();
  if (!weightKg) return NextResponse.json({ error: "weightKg required" }, { status: 400 });
  await dbConnect();
  const d = dayStart(date ? new Date(date) : new Date());
  const doc = await WeightLog.findOneAndUpdate(
    { userId: uid, date: d },
    { weightKg },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  // Update current weight on profile
  await User.findByIdAndUpdate(uid, { weightKg });
  return NextResponse.json({ log: doc });
}

export async function GET(req) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const url = new URL(req.url);
  const days = parseInt(url.searchParams.get("days") || "30", 10);
  const since = dayStart();
  since.setDate(since.getDate() - (days - 1));
  const logs = await WeightLog.find({ userId: uid, date: { $gte: since } })
    .sort({ date: 1 })
    .lean();
  return NextResponse.json({ logs });
}
