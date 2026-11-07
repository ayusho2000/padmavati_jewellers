
import "dotenv/config";
import prisma from "../src/config/prisma.js";

try {
  const result = await prisma.$queryRaw`SELECT 1 AS connected`;

  if (result?.[0]?.connected === 1 || result?.[0]?.connected === 1n) {
    console.log("Database connection successful.");
  } else {
    console.log("Query completed; inspect the returned result.");
  }
} catch {
  console.error(
    "Database connection failed. Check the hosting environment, database credentials, and MySQL access settings."
  );
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
