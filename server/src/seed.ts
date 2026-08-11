import bcrypt from "bcryptjs";
import { prisma } from "./config/database.js";

const users = [
  {
    name: "System Admin",
    email: "admin@test.com",
    role: "ADMIN" as const,
  },
  {
    name: "Sales User",
    email: "sales@test.com",
    role: "SALES" as const,
  },
  {
    name: "Warehouse User",
    email: "warehouse@test.com",
    role: "WAREHOUSE" as const,
  },
  {
    name: "Accounts User",
    email: "accounts@test.com",
    role: "ACCOUNTS" as const,
  },
];

const password = "Admin@123";

async function main() {
  const hashedPassword = await bcrypt.hash(password, 12);

  for (const user of users) {
    await prisma.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        name: user.name,
        role: user.role,
        password: hashedPassword,
      },
      create: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      },
    });
  }

  console.log(" Test users seeded successfully");
}

main()
  .catch((error) => {
    console.error(" Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });