import { NextResponse } from "next/server";

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/$/, "");
const ALLOWED = new Set([APP_URL, "http://localhost:3000"]);

export const config = {
  matcher: "/api/:path*",
};

export function middleware(req) {
  const origin = req.headers.get("origin");
  const allow = origin && ALLOWED.has(origin) ? origin : APP_URL;

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": allow,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
        Vary: "Origin",
      },
    });
  }

  const res = NextResponse.next();
  res.headers.set("Access-Control-Allow-Origin", allow);
  res.headers.set("Access-Control-Allow-Credentials", "true");
  res.headers.set("Vary", "Origin");
  return res;
}
