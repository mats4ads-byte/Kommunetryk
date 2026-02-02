import { cookies } from "next/headers";
import crypto from "crypto";
import { requireEnv } from "./security";

const COOKIE_NAME = "kglp_session";

function secret(): Buffer {
  return Buffer.from(requireEnv("SESSION_SECRET"));
}

export function setSession(userId: string) {
  // MVP: signed token = userId + timestamp + HMAC
  const ts = Date.now().toString();
  const payload = `${userId}.${ts}`;
  const sig = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  const token = `${payload}.${sig}`;
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export function clearSession() {
  cookies().set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export function getSessionUserId(): string | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, ts, sig] = parts;
  const payload = `${userId}.${ts}`;
  const expected = crypto.createHmac("sha256", secret()).update(payload).digest("hex");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  // token freshness (30 days)
  const ageMs = Date.now() - Number(ts);
  if (!Number.isFinite(ageMs) || ageMs > 30 * 24 * 60 * 60 * 1000) return null;
  return userId;
}
