import { GoogleGenerativeAI } from "@google/generative-ai";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const key = env.match(/^GEMINI_API_KEY=(.+)$/m)[1].trim();

try {
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const res = await model.generateContent("Reply with just: OK");
  console.log("✅ Gemini responded:", res.response.text().trim());
} catch (e) {
  console.log("❌", e.message);
  process.exit(1);
}
