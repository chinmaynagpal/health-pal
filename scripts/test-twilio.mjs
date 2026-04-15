import twilio from "twilio";
import { readFileSync } from "fs";

const env = readFileSync(".env.local", "utf8");
const get = (k) => env.match(new RegExp(`^${k}=(.+)$`, "m"))?.[1].trim();

try {
  const client = twilio(get("TWILIO_ACCOUNT_SID"), get("TWILIO_AUTH_TOKEN"));
  const acct = await client.api.accounts(get("TWILIO_ACCOUNT_SID")).fetch();
  console.log("✅ Twilio auth OK — account:", acct.friendlyName, "| status:", acct.status);
} catch (e) {
  console.log("❌", e.message);
  process.exit(1);
}
