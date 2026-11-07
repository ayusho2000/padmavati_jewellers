
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const collections = [
  {
    category: "GOLD",
    title: "Gold Jewellery",
    description:
      "Discover handcrafted gold jewellery designed for every celebration. Every masterpiece reflects timeless elegance, exceptional craftsmanship and unmatched luxury.",
  },
  {
    category: "DIAMOND",
    title: "Diamond Jewellery",
    description:
      "Brilliant diamonds crafted to celebrate life's precious moments with elegance and everlasting beauty.",
  },
  {
    category: "POLKI",
    title: "Polki Jewellery",
    description:
      "Royal Polki creations inspired by Indian heritage, handcrafted to perfection for weddings and grand occasions.",
  },
];

try {
  for (const collection of collections) {
    await prisma.collection.upsert({
      where: { category: collection.category },
      update: {},
      create: collection,
    });
  }

  console.log("Gold, Diamond and Polki collections initialized.");
} catch (error) {
  console.error("Unable to initialize collections:", error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
