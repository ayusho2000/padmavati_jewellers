
import prisma from "./src/config/prisma.js";

try {
  const result = await prisma.$queryRaw`
    SELECT
      current_database() AS database,
      current_user AS username
  `;

  console.log("PRISMA CONNECTION SUCCESSFUL");
  console.log(result);
} catch (error) {
  console.error("PRISMA CONNECTION FAILED");
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
