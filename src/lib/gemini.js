import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Detect food items in an image using Gemini Vision.
 * @param {string} base64 raw base64 (no data: prefix)
 * @param {string} mimeType e.g. "image/jpeg"
 * @returns {Promise<{items: Array<{name:string, commonPortion?:string, confidence?:number}>}>}
 */
export async function detectFoodsFromImage(base64, mimeType = "image/jpeg") {
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    generationConfig: { responseMimeType: "application/json" },
  });

  const prompt = `You are a nutritionist's assistant. Identify the distinct food items visible in this image.
Return ONLY JSON matching this schema:
{"items":[{"name":"<food name>","commonPortion":"<typical serving e.g. 1 bowl, 1 piece, 100g>","confidence":<0-1>}]}
Be specific (e.g. "basmati rice" not "rice"; "paneer butter masala" not "curry"). Avoid duplicates.`;

  const result = await model.generateContent([
    { inlineData: { data: base64, mimeType } },
    { text: prompt },
  ]);
  const text = result.response.text();
  try {
    const parsed = JSON.parse(text);
    if (!Array.isArray(parsed.items)) return { items: [] };
    return parsed;
  } catch {
    return { items: [] };
  }
}
