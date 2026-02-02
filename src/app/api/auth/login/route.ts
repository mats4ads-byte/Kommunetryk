export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/security";
import { setSession } from "@/lib/session";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { email?: string; password?: string; nextPath?: string }
    | null;

  if (!body?.email || !body.password) {
    return NextResponse.json({ error: "Manglende felter" }, { status: 400 });
  }

  const email = body.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { role: true } } },
  });

  if (!user || !user.isActive || !user.passwordHash) {
    return NextResponse.json({ error: "Forkert login" }, { status: 401 });
  }

  const ok = await verifyPassword(body.password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "Forkert login" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  setSession(user.id);

  // MVP redirect: use nextPath if provided
  const redirect =
    body.nextPath && body.nextPath.startsWith("/") ? body.nextPath : "/dashboard";

  return NextResponse.json({ redirect });
}
