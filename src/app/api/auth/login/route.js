import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    await dbConnect();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const token = signToken({ uid: user._id.toString() });
    return NextResponse.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, goals: user.goals },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
