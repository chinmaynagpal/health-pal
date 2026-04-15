import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import StepLog from "@/models/StepLog";

function dayStart(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export async function POST(req) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { steps, date, source } = await req.json();
  if (!steps && steps !== 0)
    return NextResponse.json({ error: "steps required" }, { status: 400 });
  await dbConnect();
  const d = dayStart(date ? new Date(date) : new Date());
  const doc = await StepLog.findOneAndUpdate(
    { userId: uid, date: d },
    { steps, source: source || "manual" },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return NextResponse.json({ log: doc });
}

export async function GET(req) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const url = new URL(req.url);
  const days = parseInt(url.searchParams.get("days") || "7", 10);
  const since = dayStart();
  since.setDate(since.getDate() - (days - 1));
  const logs = await StepLog.find({ userId: uid, date: { $gte: since } })
    .sort({ date: 1 })
    .lean();
  return NextResponse.json({ logs });
}
