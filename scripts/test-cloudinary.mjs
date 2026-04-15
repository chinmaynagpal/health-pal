import { v2 as cloudinary } from "cloudinary";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const get = (k) => env.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1].trim();

cloudinary.config({
  cloud_name: get("CLOUDINARY_CLOUD_NAME"),
  api_key: get("CLOUDINARY_API_KEY"),
  api_secret: get("CLOUDINARY_API_SECRET"),
});

try {
  const res = await cloudinary.api.ping();
  console.log("✅ Cloudinary:", res.status);
} catch (e) {
  console.log("❌", e.message || e);
  process.exit(1);
}
