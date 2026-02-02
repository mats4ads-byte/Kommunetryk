import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/session";

export async function POST(req: Request) {
  const userId = getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Ikke logget ind" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.organizationId) return NextResponse.json({ error: "Ingen organisation" }, { status: 403 });

  const body = await req.json().catch(() => null) as any;
  if (!body?.title || !body?.item || !body?.delivery) return NextResponse.json({ error: "Manglende felter" }, { status: 400 });

  const task = await prisma.task.create({
    data: {
      organizationId: user.organizationId,
      title: body.title,
      category: "signs",
      status: "draft",
      createdByUserId: userId,
      requirements: { create: { productionRequirement: "eu", noEnvironmentalRequirements: true } },
      items: {
        create: [{
          quantity: Number(body.item.quantity ?? 1),
          signItem: {
            create: {
              signType: body.item.signType,
              formatType: "standard",
              standardFormat: "A3",
              shape: "rectangle",
              material: body.item.material,
              thicknessMm: "5",
              printSides: body.item.printSides,
              surface: "uv_protected",
              fixingType: "screws_standoffs",
              supplierSuggestFixing: false,
              artworkStatus: "ready_files",
              artworkRequiresApproval: true,
              expectedLifetime: "YEARS_5_PLUS",
            }
          }
        }]
      },
      delivery: {
        create: {
          addressText: body.delivery.addressText ?? "",
          dropoffLocationType: body.delivery.dropoffLocationType,
          dropoffLocationDescription: body.delivery.dropoffLocationDescription,
          deliveryContactName: body.delivery.deliveryContactName ?? "",
          deliveryContactPhone: body.delivery.deliveryContactPhone ?? "",
          callContactOnArrival: true,
        }
      }
    },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: user.organizationId,
      actorUserId: userId,
      actorType: "org_user",
      action: "task.created",
      entityType: "task",
      entityId: task.id,
      metadataJson: { category: "signs" },
    },
  });

  return NextResponse.json({ taskId: task.id });
}
