import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database (Admissions Engine)...");

  // Hash passwords
  const adminHash = await bcrypt.hash("admin123", 12);
  const clerkHash = await bcrypt.hash("admin123", 12);

  // Clear existing users
  await prisma.user.deleteMany();

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@avenuesclinic.co.zw" },
    update: { password: adminHash },
    create: {
      email: "admin@avenuesclinic.co.zw",
      name: "SYSTEM ADMIN",
      password: adminHash,
      role: "SUPERVISOR",
      dept: "Quality Assurance",
      isSupervisor: true,
      status: "Active",
    },
  });

  console.log("Admin user created:", admin.email);

  // Create sample clerk
  const clerk = await prisma.user.upsert({
    where: { email: "clerk@avenuesclinic.co.zw" },
    update: { password: clerkHash },
    create: {
      email: "clerk@avenuesclinic.co.zw",
      name: "SAMPLE CLERK",
      password: clerkHash,
      role: "CLERK",
      dept: "Admissions",
      isSupervisor: false,
      status: "Active",
    },
  });

  console.log("Clerk user created:", clerk.email);

  console.log("\nSeeding complete!");
  console.log("\nDemo accounts:");
  console.log("   Admin:   admin@avenuesclinic.co.zw   / admin123");
  console.log("   Clerk:   clerk@avenuesclinic.co.zw   / admin123");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
