import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null) as any;
  if (!body?.name || !body?.email) return NextResponse.json({ error: "Manglende felter" }, { status: 400 });

  const supplier = await prisma.supplier.create({
    data: {
      name: body.name,
      email: body.email.toLowerCase(),
      phone: body.phone ?? null,
      status: "pending",
      capabilities: {
        create: (Array.isArray(body.capabilities) ? body.capabilities : []).map((c: string) => ({ capability: c })),
      },
      production: body.productionCountryType ? {
        create: {
          productionCountryType: body.productionCountryType,
          documentationPossible: false,
        }
      } : undefined,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorType: "system",
      action: "supplier.applied",
      entityType: "supplier",
      entityId: supplier.id,
      metadataJson: { email: supplier.email },
    },
  });

  return NextResponse.json({ ok: true });
}
