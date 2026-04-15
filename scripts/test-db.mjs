import mongoose from "mongoose";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const uri = env.match(/^MONGODB_URI=(.+)$/m)[1].trim();

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log("✅ Connected to MongoDB");
  console.log("   DB name:", mongoose.connection.name);
  await mongoose.disconnect();
  process.exit(0);
} catch (e) {
  console.log("❌", e.message);
  process.exit(1);
}
