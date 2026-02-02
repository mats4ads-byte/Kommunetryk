import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const PASSWORD = "Demo1234!";
const passwordHash = await bcrypt.hash(PASSWORD, 10);

async function main() {
  // Organization
  const org = await prisma.organization.upsert({
    where: { name: "Syddjurs Kommune" },
    update: {},
    create: {
      name: "Syddjurs Kommune",
    },
  });

  // Roles
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { key: "org_admin" },
      update: {},
      create: { key: "org_admin", name: "Kommune Admin" },
    }),
    prisma.role.upsert({
      where: { key: "org_user" },
      update: {},
      create: { key: "org_user", name: "Kommune Bruger" },
    }),
    prisma.role.upsert({
      where: { key: "supplier_user" },
      update: {},
      create: { key: "supplier_user", name: "Leverandør Bruger" },
    }),
  ]);

  const roleMap = Object.fromEntries(roles.map(r => [r.key, r]));

  // Kommune admin
  await prisma.user.upsert({
    where: { email: "admin@syddjurs.demo" },
    update: {},
    create: {
      email: "admin@syddjurs.demo",
      fullName: "Kommune Admin",
      passwordHash,
      organizationId: org.id,
      roles: {
        create: {
          roleId: roleMap.org_admin.id,
        },
      },
    },
  });

  // Kommune bruger
  await prisma.user.upsert({
    where: { email: "user@syddjurs.demo" },
    update: {},
    create: {
      email: "user@syddjurs.demo",
      fullName: "Kommune Bruger",
      passwordHash,
      organizationId: org.id,
      roles: {
        create: {
          roleId: roleMap.org_user.id,
        },
      },
    },
  });

  // Leverandør
  const supplier = await prisma.supplier.upsert({
    where: { email: "supplier@leverandoer.demo" },
    update: {},
    create: {
      name: "Demo Leverandør",
      email: "supplier@leverandoer.demo",
      status: "approved",
    },
  });

  await prisma.user.upsert({
    where: { email: "supplier@leverandoer.demo" },
    update: {},
    create: {
      email: "supplier@leverandoer.demo",
      fullName: "Leverandør Bruger",
      passwordHash,
      supplierUsers: {
        create: {
          supplierId: supplier.id,
        },
      },
      roles: {
        create: {
          roleId: roleMap.supplier_user.id,
        },
      },
    },
  });

  console.log("✅ Demo-brugere oprettet");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
