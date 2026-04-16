import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";

export async function GET(req) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const user = await User.findById(uid).select("goals");
  return NextResponse.json({ goals: user?.goals || {} });
}

export async function PUT(req) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { dailyCalories, dailySteps, targetWeightKg } = await req.json();

  const cal = Number(dailyCalories);
  const stp = Number(dailySteps);
  const tw = targetWeightKg ? Number(targetWeightKg) : null;
  if (!cal || cal < 500 || cal > 10000)
    return NextResponse.json({ error: "Daily calories must be between 500 and 10,000" }, { status: 400 });
  if (!stp || stp < 100 || stp > 200000)
    return NextResponse.json({ error: "Daily steps must be between 100 and 200,000" }, { status: 400 });
  if (tw !== null && (tw < 20 || tw > 500))
    return NextResponse.json({ error: "Target weight must be between 20 and 500 kg" }, { status: 400 });

  await dbConnect();
  const user = await User.findByIdAndUpdate(
    uid,
    {
      $set: {
        "goals.dailyCalories": cal,
        "goals.dailySteps": stp,
        "goals.targetWeightKg": tw,
      },
    },
    { new: true }
  ).select("goals");
  return NextResponse.json({ goals: user.goals });
}
