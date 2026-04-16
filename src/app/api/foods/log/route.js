import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import FoodLog from "@/models/FoodLog";
import User from "@/models/User";
import { nutritionForPortion } from "@/lib/usda";
import { sendWhatsApp } from "@/lib/twilio";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { imageUrl, items } = await req.json();
    if (!Array.isArray(items) || !items.length)
      return NextResponse.json({ error: "items required" }, { status: 400 });

    for (const it of items) {
      if (!it.foodName || !it.portion || !String(it.portion).trim()) {
        return NextResponse.json(
          { error: `Portion size is required for "${it.foodName || "item"}"` },
          { status: 400 }
        );
      }
    }

    await dbConnect();

    const enriched = await Promise.all(
      items.map(async (it) => {
        const n = await nutritionForPortion(it.foodName, it.portion);
        return {
          foodName: it.foodName,
          portion: it.portion,
          grams: n.grams || 0,
          calories: n.calories || 0,
          protein: n.protein || 0,
          carbs: n.carbs || 0,
          fat: n.fat || 0,
          fdcId: n.fdcId,
          matched: n.matched || null,
          error: n.error || null,
        };
      })
    );

    const totalCalories = enriched.reduce((s, x) => s + (x.calories || 0), 0);
    console.log(`[log] Total: ${totalCalories} kcal for ${enriched.length} items (user ${uid})`);

    const log = await FoodLog.create({
      userId: uid,
      imageUrl,
      items: enriched,
      totalCalories,
    });

    // Fire-and-forget WhatsApp
    User.findById(uid)
      .then((user) => {
        if (!user?.whatsappNumber) return;
        const summary = enriched
          .map((e) => `${e.foodName} (${e.portion})`)
          .join(", ");
        sendWhatsApp(
          user.whatsappNumber,
          `Health Pal Update: Meal logged - ${summary} = ${totalCalories} kcal`
        );
      })
      .catch(() => {});

    return NextResponse.json({ log });
  } catch (e) {
    console.error("[log] Error:", e.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await dbConnect();

  const url = new URL(req.url);
  const days = parseInt(url.searchParams.get("days") || "1", 10);
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - (days - 1));

  const logs = await FoodLog.find({ userId: uid, loggedAt: { $gte: since } })
    .sort({ loggedAt: -1 })
    .lean();
  return NextResponse.json({ logs });
}
