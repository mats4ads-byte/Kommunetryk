import { getSessionUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function TaskDetail({ params }: { params: { id: string } }) {
  const userId = getSessionUserId();
  if (!userId) return <div>Ikke logget ind</div>;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.organizationId) return <div>Ingen organisation tilknyttet</div>;

  const task = await prisma.task.findFirst({
    where: { id: params.id, organizationId: user.organizationId },
    include: {
      items: { include: { signItem: true } },
      delivery: true,
      montage: true,
      requirements: true,
      invitations: { include: { supplier: true } },
    },
  });

  if (!task) return <div>Opgave ikke fundet</div>;

  return (
    <main>
      <Link href="/org/tasks">← Tilbage</Link>
      <h1>{task.title}</h1>
      <p>Status: <strong>{task.status}</strong></p>
      <h2>Skilte</h2>
      <ul>
        {task.items.map((it) => (
          <li key={it.id}>
            {it.quantity} stk – {it.signItem?.signType} – {it.signItem?.material} – {it.signItem?.printSides}
          </li>
        ))}
      </ul>
      <h2>Levering</h2>
      {task.delivery ? (
        <div>
          <div><strong>Adresse:</strong> {task.delivery.addressText}</div>
          <div><strong>Må stilles:</strong> {task.delivery.dropoffLocationType} – {task.delivery.dropoffLocationDescription}</div>
          <div><strong>Kontakt:</strong> {task.delivery.deliveryContactName} ({task.delivery.deliveryContactPhone})</div>
        </div>
      ) : <div>Ikke udfyldt</div>}
      <h2>Krav</h2>
      <div>Produktion: {task.requirements?.productionRequirement ?? "eu (default)"}</div>

      <h2>Invitationer</h2>
      <ul>
        {task.invitations.map(inv => (
          <li key={inv.id}>{inv.supplier.name} – {inv.status}</li>
        ))}
      </ul>
    </main>
  );
}
