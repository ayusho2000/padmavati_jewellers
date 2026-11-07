
import prisma from "./src/config/prisma.js";

const checks = [
  ["Admin", () => prisma.admin.count()],
  ["Hero", () => prisma.hero.count()],
  ["Product", () => prisma.product.count()],
  ["Testimonial", () => prisma.testimonial.count()],
  ["InstagramPost", () => prisma.instagramPost.count()],
  ["Collection", () => prisma.collection.count()],
  ["Media", () => prisma.media.count()],
  ["ContactSubmission", () => prisma.contactSubmission.count()],
];

try {
  console.log("DATABASE:", await prisma.$queryRaw`
    SELECT current_database() AS database
  `);

  for (const [table, countRecords] of checks) {
    try {
      console.log(`${table}:`, await countRecords(), "records");
    } catch (error) {
      console.log(`${table}: ERROR -`, error.message);
    }
  }
} catch (error) {
  console.error("DATABASE CHECK FAILED:", error.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
