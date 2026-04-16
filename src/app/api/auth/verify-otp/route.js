import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const { email, code } = await req.json();
    if (!email || !code)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    await dbConnect();
    const otp = await Otp.findOne({
      email: email.toLowerCase(),
      code,
      expiresAt: { $gt: new Date() },
      verified: false,
    });

    if (!otp)
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });

    otp.verified = true;
    await otp.save();

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const token = signToken({ uid: user._id.toString() });
    return NextResponse.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, goals: user.goals },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
