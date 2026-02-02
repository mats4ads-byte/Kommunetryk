import { getSessionUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export default async function SupplierTaskDetail({ params }: { params: { taskId: string } }) {
  const userId = getSessionUserId();
  if (!userId) return <div>Ikke logget ind</div>;

  const supplierUser = await prisma.supplierUser.findFirst({ where: { userId } });
  if (!supplierUser) return <div>Ingen leverandør tilknyttet</div>;

  const invitation = await prisma.taskInvitation.findUnique({
    where: { taskId_supplierId: { taskId: params.taskId, supplierId: supplierUser.supplierId } },
    include: { task: { include: { items: { include: { signItem: true } }, delivery: true, requirements: true } } },
  });

  if (!invitation) return <div>Ingen adgang til denne opgave</div>;

  return (
    <main style={{ maxWidth: 760 }}>
      <h1>{invitation.task.title}</h1>
      <p style={{ color: "#666" }}>Status: {invitation.status}</p>

      <h2>Skilte</h2>
      <ul>
        {invitation.task.items.map((it) => (
          <li key={it.id}>
            {it.quantity} stk — {it.signItem?.signType} — {it.signItem?.material} — {it.signItem?.printSides}
          </li>
        ))}
      </ul>

      <h2>Levering</h2>
      {invitation.task.delivery ? (
        <div>
          <div><strong>Adresse:</strong> {invitation.task.delivery.addressText}</div>
          <div><strong>Må stilles:</strong> {invitation.task.delivery.dropoffLocationType} — {invitation.task.delivery.dropoffLocationDescription}</div>
        </div>
      ) : <div>Ikke udfyldt</div>}

      <h2>Krav</h2>
      <div>Produktion: {invitation.task.requirements?.productionRequirement ?? "eu"}</div>

      <p style={{ marginTop: 16, padding: 12, background: "#fff7e6", border: "1px solid #ffe3a3", borderRadius: 8 }}>
        Næste skridt i kodningen: Tilbudsformular + upload dokumentation (kommer i Kapitel 4).
      </p>
    </main>
  );
}
