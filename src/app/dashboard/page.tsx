import { getSessionUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function Dashboard() {
  const userId = getSessionUserId();
  if (!userId) return <div>Ikke logget ind</div>;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { roles: { include: { role: true } }, organization: true, supplierUsers: { include: { supplier: true } } },
  });

  if (!user) return <div>Bruger ikke fundet</div>;

  const roleKeys = user.roles.map((r) => r.role.key);

  return (
    <main>
      <h1>Dashboard</h1>
      <p>
        Logget ind som <strong>{user.fullName}</strong> ({user.email})
      </p>
      <p style={{ color: "#666" }}>
        Roller: {roleKeys.join(", ") || "ingen"}{" "}
        {user.organization ? `• Organisation: ${user.organization.name}` : ""}
        {user.supplierUsers.length ? `• Leverandør: ${user.supplierUsers[0].supplier.name}` : ""}
      </p>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {user.organization && (
          <>
            <Link href="/org/tasks" style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>Opgaver</Link>
            <Link href="/org/tasks/new/signs" style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>Opret skilte-opgave</Link>
          </>
        )}
        {user.supplierUsers.length > 0 && (
          <Link href="/supplier/tasks" style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>Leverandør: Opgaver</Link>
        )}
        <Link href="/api/auth/logout" style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}>Log ud</Link>
      </div>
    </main>
  );
}
