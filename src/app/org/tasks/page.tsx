import { getSessionUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function OrgTasksPage() {
  const userId = getSessionUserId();
  if (!userId) return <div>Ikke logget ind</div>;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.organizationId) return <div>Ingen organisation tilknyttet</div>;

  const tasks = await prisma.task.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main>
      <h1>Opgaver</h1>
      <p><Link href="/org/tasks/new/signs">+ Opret skilte-opgave</Link></p>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>Titel</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>Status</th>
            <th style={{ textAlign: "left", borderBottom: "1px solid #eee", padding: 8 }}>Oprettet</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t.id}>
              <td style={{ borderBottom: "1px solid #f2f2f2", padding: 8 }}>
                <Link href={`/org/tasks/${t.id}`}>{t.title}</Link>
              </td>
              <td style={{ borderBottom: "1px solid #f2f2f2", padding: 8 }}>{t.status}</td>
              <td style={{ borderBottom: "1px solid #f2f2f2", padding: 8 }}>{t.createdAt.toISOString().slice(0,10)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
