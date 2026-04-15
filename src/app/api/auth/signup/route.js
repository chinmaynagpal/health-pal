import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/mongoose";
import User from "@/models/User";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const { name, email, password, heightCm, weightKg, whatsappNumber } = await req.json();
    if (!name || !email || !password)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    await dbConnect();
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash: await hashPassword(password),
      heightCm,
      weightKg,
      whatsappNumber,
    });

    const token = signToken({ uid: user._id.toString() });
    return NextResponse.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
