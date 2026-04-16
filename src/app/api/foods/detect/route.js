import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { detectFoodsFromImage } from "@/lib/gemini";
import { uploadDataUri } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) return NextResponse.json({ error: "imageBase64 required" }, { status: 400 });

    const match = imageBase64.match(/^data:(image\/[a-z+]+);base64,(.+)$/i);
    if (!match) return NextResponse.json({ error: "Invalid data URI" }, { status: 400 });
    const mimeType = match[1];
    const raw = match[2];

    const [detection, imageUrl] = await Promise.all([
      detectFoodsFromImage(raw, mimeType),
      uploadDataUri(imageBase64).catch((e) => {
        console.error("[detect] Cloudinary upload failed:", e.message);
        return null;
      }),
    ]);

    console.log(`[detect] Found ${detection.items?.length || 0} items for user ${uid}`);

    if (!detection.items?.length) {
      return NextResponse.json({
        imageUrl,
        items: [],
        note: "No food detected. Try a clearer photo or add items manually.",
      });
    }

    return NextResponse.json({
      imageUrl,
      items: detection.items,
      note: "Please provide portion size for each item before logging.",
    });
  } catch (e) {
    console.error("[detect] Error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
