import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/auth";
import { dbConnect } from "@/lib/mongoose";
import FoodLog from "@/models/FoodLog";
import User from "@/models/User";
import { calculateFromIndianDb } from "@/lib/indianFoodDb";
import { nutritionForPortion } from "@/lib/usda";
import { sendWhatsApp } from "@/lib/twilio";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req) {
  const uid = getUserIdFromRequest(req);
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { items } = await req.json();
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

    // Calculate nutrition: Indian DB first, USDA fallback
    const enriched = [];
    for (const it of items) {
      // Try Indian food database first
      const indianResult = calculateFromIndianDb(it.foodName, it.portion);

      if (indianResult) {
        console.log(`[log] ${it.foodName} (${it.portion}) → ${indianResult.grams}g → ${indianResult.calories} kcal [indian_db]`);
        enriched.push(indianResult);
      } else {
        // Fallback to USDA
        console.log(`[log] ${it.foodName} not in Indian DB, trying USDA...`);
        const usdaResult = await nutritionForPortion(it.foodName, it.portion);
        enriched.push({
          foodName: usdaResult.foodName,
          portion: usdaResult.portion,
          grams: usdaResult.grams || 0,
          calories: usdaResult.calories || 0,
          protein: usdaResult.protein || 0,
          carbs: usdaResult.carbs || 0,
          fat: usdaResult.fat || 0,
          matched: usdaResult.matched || null,
          source: "usda",
          error: usdaResult.error || null,
        });
      }
    }

    const totalCalories = enriched.reduce((s, x) => s + (x.calories || 0), 0);
    console.log(`[log] Total: ${totalCalories} kcal for ${enriched.length} items (user ${uid})`);

    const log = await FoodLog.create({
      userId: uid,
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
