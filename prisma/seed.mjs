import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Roles
  const roles = [
    { key: "org_admin", name: "Kommune-admin" },
    { key: "org_user", name: "Kommune-bruger" },
    { key: "supplier_user", name: "Leverandør" },
  ];
  for (const r of roles) {
    await prisma.role.upsert({
      where: { key: r.key },
      update: { name: r.name },
      create: r,
    });
  }

  // Demo organization
  const org = await prisma.organization.upsert({
    where: { name: "Syddjurs Kommune" },
    update: {},
    create: { name: "Syddjurs Kommune", defaultEAN: "5798000000000" },
  });

  const pw = await bcrypt.hash("Demo1234!", 12);

  // Demo org admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@syddjurs.demo" },
    update: { organizationId: org.id, fullName: "Admin (Syddjurs)", passwordHash: pw, isActive: true },
    create: { email: "admin@syddjurs.demo", organizationId: org.id, fullName: "Admin (Syddjurs)", passwordHash: pw },
  });
  const orgAdminRole = await prisma.role.findUnique({ where: { key: "org_admin" } });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: admin.id, roleId: orgAdminRole.id } },
    update: {},
    create: { userId: admin.id, roleId: orgAdminRole.id },
  });

  // Demo org user
  const user = await prisma.user.upsert({
    where: { email: "user@syddjurs.demo" },
    update: { organizationId: org.id, fullName: "Bruger (Syddjurs)", passwordHash: pw, isActive: true },
    create: { email: "user@syddjurs.demo", organizationId: org.id, fullName: "Bruger (Syddjurs)", passwordHash: pw },
  });
  const orgUserRole = await prisma.role.findUnique({ where: { key: "org_user" } });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: user.id, roleId: orgUserRole.id } },
    update: {},
    create: { userId: user.id, roleId: orgUserRole.id },
  });

  // Demo supplier + supplier user
  const supplier = await prisma.supplier.upsert({
    where: { email: "kontakt@leverandoer.demo" },
    update: { status: "approved" },
    create: { name: "Leverandør Demo ApS", email: "kontakt@leverandoer.demo", status: "approved" },
  });

  // capabilities + production
  await prisma.supplierCapability.upsert({
    where: { supplierId_capability: { supplierId: supplier.id, capability: "signs" } },
    update: {},
    create: { supplierId: supplier.id, capability: "signs" },
  });
  await prisma.supplierProduction.upsert({
    where: { supplierId: supplier.id },
    update: { productionCountryType: "eu" },
    create: { supplierId: supplier.id, productionCountryType: "eu" },
  });

  const supplierUser = await prisma.user.upsert({
    where: { email: "supplier@leverandoer.demo" },
    update: { organizationId: null, fullName: "Leverandør Bruger", passwordHash: pw, isActive: true },
    create: { email: "supplier@leverandoer.demo", fullName: "Leverandør Bruger", passwordHash: pw },
  });
  const supplierRole = await prisma.role.findUnique({ where: { key: "supplier_user" } });
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: supplierUser.id, roleId: supplierRole.id } },
    update: {},
    create: { userId: supplierUser.id, roleId: supplierRole.id },
  });

  await prisma.supplierUser.upsert({
    where: { supplierId_userId: { supplierId: supplier.id, userId: supplierUser.id } },
    update: {},
    create: { supplierId: supplier.id, userId: supplierUser.id },
  });

  console.log("Seed complete.");
  console.log("Demo logins:");
  console.log(" - Kommune admin: admin@syddjurs.demo / Demo1234!");
  console.log(" - Kommune bruger: user@syddjurs.demo / Demo1234!");
  console.log(" - Leverandør: supplier@leverandoer.demo / Demo1234!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
