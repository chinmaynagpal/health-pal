import { NextResponse } from "next/server";
import crypto from "crypto";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { comparePassword } from "@/lib/auth";
import { sendOtpEmail } from "@/lib/mail";

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    await dbConnect();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const ok = await comparePassword(password, user.passwordHash);
    if (!ok)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    const code = crypto.randomInt(100000, 999999).toString();
    await Otp.deleteMany({ email: email.toLowerCase() });
    await Otp.create({
      email: email.toLowerCase(),
      code,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOtpEmail(email, code);

    return NextResponse.json({ message: "OTP sent", email: email.toLowerCase() });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
