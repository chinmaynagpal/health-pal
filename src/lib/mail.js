import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendOtpEmail(to, code) {
  await transporter.sendMail({
    from: `"Health Pal" <${process.env.SMTP_USER}>`,
    to,
    subject: `${code} is your Health Pal verification code`,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:420px;margin:0 auto;padding:32px 24px;">
        <h2 style="margin:0 0 8px;font-size:22px;color:#111;">Verify your login</h2>
        <p style="margin:0 0 24px;color:#555;font-size:15px;">
          Enter this code to complete your sign-in to Health Pal.
        </p>
        <div style="background:#f5f5f5;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
          <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#111;">${code}</span>
        </div>
        <p style="margin:0;color:#999;font-size:13px;">
          This code expires in 5 minutes. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
  });
}
