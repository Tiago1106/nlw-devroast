import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";

let client: postgres.Sql | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  return databaseUrl;
}

function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  client = postgres(getDatabaseUrl(), {
    max: 1,
    prepare: false,
  });
  dbInstance = drizzle({ client, schema, casing: "snake_case" });

  return dbInstance;
}

async function closeDbConnection() {
  if (!client) {
    return;
  }

  await client.end();
  client = null;
  dbInstance = null;
}

function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export { closeDbConnection, getDb, isDatabaseConfigured };
