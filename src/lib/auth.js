import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export function hashPassword(pw) {
  return bcrypt.hash(pw, 10);
}
export function comparePassword(pw, hash) {
  return bcrypt.compare(pw, hash);
}
export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: "30d" });
}
export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

export function getUserIdFromRequest(req) {
  const auth = req.headers.get("authorization");
  let token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) {
    try {
      token = cookies().get("hp_token")?.value;
    } catch {}
  }
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded?.uid || null;
}
