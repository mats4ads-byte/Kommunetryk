import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

type ProductionRequirement = "denmark" | "eu" | "global";
type ProductionCountryType = "denmark" | "eu" | "global";

/**
 * Minimal type vi har brug for fra en supplier i denne route.
 * (Undgår Prisma-type afhængigheder som kan variere mellem versions)
 */
type SupplierWithProduction = {
  id: string;
  production: null | {
    productionCountryType: string | null;
  };
};

function productionAllows(
  requirement: ProductionRequirement,
  supplierType: ProductionCountryType
): boolean {
  if (requirement === "global") return true;
  if (requirement === "eu") return supplierType === "eu" || supplierType === "denmark";
  if (requirement === "denmark") return supplierType === "denmark";
  return false;
}

function toRequirement(value: unknown): ProductionRequirement {
  if (value === "denmark" || value === "eu" || value === "global") return value;
  return "eu";
}

function toSupplierType(value: unknown): ProductionCountryType {
  if (value === "denmark" || value === "eu" || value === "global") return value;
  return "global";
}

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.organizationId) return NextResponse.json({ error: "Ingen organisation" }, { status: 403 });

  const task = await prisma.task.findFirst({
    where: { id: params.id, organizationId: user.organizationId },
    include: {
      requirements: true,
      items: { include: { signItem: true } },
      delivery: true,
    },
  });

  if (!task) return NextResponse.json({ error: "Opgave ikke fundet" }, { status: 404 });
  if (task.status !== "draft") {
    return NextResponse.json({ error: "Opgaven er allerede sendt eller låst" }, { status: 400 });
  }
  if (!task.items.length) return NextResponse.json({ error: "Ingen skiltlinjer" }, { status: 400 });
  if (!task.delivery?.dropoffLocationDescription) {
    return NextResponse.json({ error: "Levering mangler placering" }, { status: 400 });
  }

  const requirement: ProductionRequirement = toRequirement(task.requirements?.productionRequirement);

  // Hent kun de felter vi bruger (id + productionCountryType)
  const suppliers: SupplierWithProduction[] = await prisma.supplier.findMany({
    where: {
      status: "approved",
      capabilities: { some: { capability: "signs" } },
      production: { is: {} },
    },
    select: {
      id: true,
      production: {
        select: { productionCountryType: true },
      },
    },
    take: 25,
  });

  const matched = suppliers.filter((s: SupplierWithProduction) => {
    const supplierType: ProductionCountryType = toSupplierType(
      s.production?.productionCountryType ?? "global"
    );
    return productionAllows(requirement, supplierType);
  });

  if (matched.length === 0) {
    return NextResponse.json({ error: "Ingen matchende leverandører (MVP)" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: task.id },
      data: { status: "sent", sentAt: new Date() },
    });

    for (const s of matched) {
      await tx.taskInvitation.create({
        data: { taskId: task.id, supplierId: s.id, status: "sent" },
      });
    }

    await tx.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorUserId: userId,
        actorType: "org_user",
        action: "task.sent_to_suppliers",
        entityType: "task",
        entityId: task.id,
        metadataJson: { invitedSuppliers: matched.length },
      },
    });
  });

  return NextResponse.json({ ok: true, invited: matched.length });
}
