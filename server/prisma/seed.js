import "dotenv/config";

import bcrypt from "bcrypt";

import prisma from "../src/config/prisma.js";

const OWNER_NAME = process.env.OWNER_NAME;
const OWNER_EMAIL = process.env.OWNER_EMAIL;
const OWNER_PASSWORD = process.env.OWNER_PASSWORD;

async function main() {
  if (!OWNER_NAME || !OWNER_EMAIL || !OWNER_PASSWORD) {
    throw new Error(
      "OWNER_NAME, OWNER_EMAIL and OWNER_PASSWORD must be defined in .env"
    );
  }

  if (OWNER_PASSWORD.length < 8) {
    throw new Error(
      "OWNER_PASSWORD must be at least 8 characters long"
    );
  }

  const email = OWNER_EMAIL.trim().toLowerCase();

  const existingAdmin = await prisma.admin.findUnique({
    where: {
      email,
    },
  });

  if (existingAdmin) {
    console.log(
      `Admin with email ${email} already exists. No new account created.`
    );

    return;
  }

  const passwordHash = await bcrypt.hash(OWNER_PASSWORD, 12);

  const owner = await prisma.admin.create({
    data: {
      name: OWNER_NAME.trim(),
      email,
      passwordHash,
      role: "OWNER",
      status: "ACTIVE",
    },
  });

  console.log("OWNER ACCOUNT CREATED SUCCESSFULLY");
  console.log(`ID: ${owner.id}`);
  console.log(`Name: ${owner.name}`);
  console.log(`Email: ${owner.email}`);
  console.log(`Role: ${owner.role}`);
  console.log(`Status: ${owner.status}`);
}

main()
  .catch((error) => {
    console.error("OWNER SEED FAILED");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });