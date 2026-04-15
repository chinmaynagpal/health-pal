/**
 * Canonical public URL for the Health Pal app.
 * Falls back to localhost only if the env var is unset (e.g. a fresh clone).
 */
export const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
).replace(/\/$/, "");

/**
 * Allow-list of origins the API accepts cross-origin requests from.
 * Production domain is always included; localhost is included in dev.
 */
export const ALLOWED_ORIGINS = [
  APP_URL,
  ...(process.env.NODE_ENV !== "production" ? ["http://localhost:3000"] : []),
];
