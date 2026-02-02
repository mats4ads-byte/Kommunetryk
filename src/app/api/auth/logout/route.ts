import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export async function GET() {
  clearSession();
  return NextResponse.redirect(new URL("/login", process.env.APP_URL || "http://localhost:3000"));
}
