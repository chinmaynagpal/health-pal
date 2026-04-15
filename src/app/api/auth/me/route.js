import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(req) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const user = await User.findById(uid).select("-passwordHash");
  return NextResponse.json({ user });
}

export async function PATCH(req) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await dbConnect();
  const allowed = ["name", "heightCm", "weightKg", "whatsappNumber", "goals"];
  const update = {};
  for (const k of allowed) if (k in body) update[k] = body[k];
  const user = await User.findByIdAndUpdate(uid, update, { new: true }).select("-passwordHash");
  return NextResponse.json({ user });
}
