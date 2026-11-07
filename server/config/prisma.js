
// import "dotenv/config";

// import { PrismaClient } from "@prisma/client";
// import { PrismaMariaDb } from "@prisma/adapter-mariadb";

// const adapter = new PrismaMariaDb({
//   host: process.env.DB_HOST,
//   port: Number(process.env.DB_PORT || 3306),
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   connectionLimit: 5,
// });

// const prisma = new PrismaClient({ adapter });

// export default prisma;




import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

function createMariaDbAdapter() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is missing from the .env file.");
  }

  let databaseUrl;

  try {
    databaseUrl = new URL(connectionString);
  } catch {
    throw new Error("DATABASE_URL is not a valid database URL.");
  }

  if (!["mysql:", "mariadb:"].includes(databaseUrl.protocol)) {
    throw new Error(
      "DATABASE_URL must use the mysql:// or mariadb:// scheme."
    );
  }

  const database = decodeURIComponent(
    databaseUrl.pathname.replace(/^\/+/, "")
  );

  if (
    !databaseUrl.hostname ||
    !databaseUrl.username ||
    !databaseUrl.password ||
    !database
  ) {
    throw new Error(
      "DATABASE_URL must include the host, username, password, and database name."
    );
  }

  return new PrismaMariaDb({
    host: databaseUrl.hostname,
    port: Number(databaseUrl.port || 3306),
    user: decodeURIComponent(databaseUrl.username),
    password: decodeURIComponent(databaseUrl.password),
    database,
    connectionLimit: 5,
  });
}

const adapter = createMariaDbAdapter();
const prisma = new PrismaClient({ adapter });

export default prisma;
