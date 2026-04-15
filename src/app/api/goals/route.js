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
  await dbConnect();
  const user = await User.findByIdAndUpdate(
    uid,
    {
      $set: {
        "goals.dailyCalories": dailyCalories,
        "goals.dailySteps": dailySteps,
        "goals.targetWeightKg": targetWeightKg,
      },
    },
    { new: true }
  ).select("goals");
  return NextResponse.json({ goals: user.goals });
}
