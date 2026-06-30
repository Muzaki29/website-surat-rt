import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { importLegacyJsonIfEmpty } from "@/lib/storage";

const DEFAULT_USERS = [
  {
    email: "admin@rt001.local",
    name: "Admin RT",
    password: "admin123",
    role: "admin",
  },
  {
    email: "ketua@rt001.local",
    name: "Ketua RT",
    password: "ketua123",
    role: "ketua-rt",
  },
  {
    email: "sekretaris@rt001.local",
    name: "Sekretaris RT",
    password: "sekretaris123",
    role: "sekretaris-rt",
  },
  {
    email: "bendahara@rt001.local",
    name: "Bendahara RT",
    password: "bendahara123",
    role: "bendahara-rt",
  },
];

async function main() {
  for (const user of DEFAULT_USERS) {
    const exists = await prisma.user.findUnique({ where: { email: user.email } });
    if (exists) continue;

    await prisma.user.create({
      data: {
        email: user.email,
        name: user.name,
        role: user.role,
        password: await bcrypt.hash(user.password, 10),
      },
    });
  }

  await prisma.suratCounter.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", keluar: 0, masuk: 0 },
    update: {},
  });

  await importLegacyJsonIfEmpty();

  console.log("Seed selesai — akun demo:");
  DEFAULT_USERS.forEach((u) => console.log(`  ${u.email} / ${u.password} (${u.role})`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
