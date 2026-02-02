import { getSessionUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function SupplierTasks() {
  const userId = getSessionUserId();
  if (!userId) return <div>Ikke logget ind</div>;

  const supplierUser = await prisma.supplierUser.findFirst({
    where: { userId },
    include: { supplier: true },
  });
  if (!supplierUser) return <div>Ingen leverandør tilknyttet denne bruger</div>;
  if (supplierUser.supplier.status !== "approved") return <div>Leverandør er ikke godkendt endnu.</div>;

  const invitations = await prisma.taskInvitation.findMany({
    where: { supplierId: supplierUser.supplierId },
    include: { task: { include: { organization: true } } },
    orderBy: { sentAt: "desc" },
    take: 50,
  });

  return (
    <main>
      <h1>Opgaver til jer</h1>
      <p style={{ color: "#666" }}>I kan ikke se andre leverandører på opgaverne.</p>
      <ul>
        {invitations.map((inv) => (
          <li key={inv.id}>
            <Link href={`/supplier/tasks/${inv.taskId}`}>{inv.task.title}</Link> — {inv.task.organization.name} — {inv.status}
          </li>
        ))}
      </ul>
    </main>
  );
}
