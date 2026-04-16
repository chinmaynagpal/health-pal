import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getModel() {
  return genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: { responseMimeType: "application/json" },
  });
}

function cleanJson(text) {
  return text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
}

/**
 * Detect food items in an image using Gemini Vision.
 */
export async function detectFoodsFromImage(base64, mimeType = "image/jpeg") {
  const model = getModel();

  const prompt = `You are a nutritionist's assistant. Identify the distinct food items visible in this image.
Return ONLY JSON matching this schema:
{"items":[{"name":"<food name>","commonPortion":"<typical serving e.g. 1 bowl, 1 piece, 100g>","confidence":<0-1>}]}
Be specific (e.g. "basmati rice" not "rice"; "paneer butter masala" not "curry"). Avoid duplicates.`;

  try {
    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType } },
      { text: prompt },
    ]);
    const parsed = JSON.parse(cleanJson(result.response.text()));
    if (!Array.isArray(parsed.items)) return { items: [] };
    return parsed;
  } catch (e) {
    console.error("[gemini] Detection failed:", e.message);
    return { items: [] };
  }
}

/**
 * Calculate nutrition for a list of food items with portions using Gemini.
 * @param {Array<{foodName: string, portion: string}>} items
 * @returns {Promise<Array<{foodName, portion, grams, calories, protein, carbs, fat}>>}
 */
export async function calculateNutrition(items) {
  const model = getModel();

  const foodList = items
    .map((it, i) => `${i + 1}. ${it.foodName} — portion: ${it.portion}`)
    .join("\n");

  const prompt = `You are an expert nutritionist. Calculate accurate nutrition for each food item below.

For each item:
1. Convert the portion to grams
2. Calculate calories, protein, carbs, and fat based on standard nutrition data

Food items:
${foodList}

Return ONLY JSON matching this exact schema:
{"items":[{"foodName":"<name>","portion":"<original portion>","grams":<number>,"calories":<number>,"protein":<number with 1 decimal>,"carbs":<number with 1 decimal>,"fat":<number with 1 decimal>}]}

Rules:
- Use widely accepted nutrition values (similar to USDA FoodData Central)
- Be accurate — do NOT guess randomly
- Calories must be realistic for the given portion size
- grams must reflect the actual weight of the portion
- All numbers must be plain numbers, not strings
- Return every item in the same order as input`;

  try {
    const result = await model.generateContent(prompt);
    const parsed = JSON.parse(cleanJson(result.response.text()));

    if (!Array.isArray(parsed.items) || parsed.items.length !== items.length) {
      console.error("[gemini] Nutrition response item count mismatch");
      return null;
    }

    // Validate each item has required fields and reasonable values
    for (const it of parsed.items) {
      if (typeof it.calories !== "number" || it.calories < 0) it.calories = 0;
      if (typeof it.protein !== "number" || it.protein < 0) it.protein = 0;
      if (typeof it.carbs !== "number" || it.carbs < 0) it.carbs = 0;
      if (typeof it.fat !== "number" || it.fat < 0) it.fat = 0;
      if (typeof it.grams !== "number" || it.grams <= 0) it.grams = 0;
    }

    return parsed.items;
  } catch (e) {
    console.error("[gemini] Nutrition calculation failed:", e.message);
    return null;
  }
}
