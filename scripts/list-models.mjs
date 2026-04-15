import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const key = env.match(/^GEMINI_API_KEY=(.+)$/m)[1].trim();

const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
const data = await res.json();
for (const m of data.models || []) {
  if ((m.supportedGenerationMethods || []).includes("generateContent")) {
    console.log(m.name);
  }
}
