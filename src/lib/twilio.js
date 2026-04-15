import twilio from "twilio";

const sid = process.env.TWILIO_ACCOUNT_SID;
const token = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_FROM;

let client = null;
if (sid && token) client = twilio(sid, token);

export async function sendWhatsApp(to, body) {
  if (!client || !to) return { skipped: true };
  const toAddr = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  try {
    const msg = await client.messages.create({ from, to: toAddr, body });
    return { sid: msg.sid };
  } catch (e) {
    console.error("[twilio]", e.message);
    return { error: e.message };
  }
}
