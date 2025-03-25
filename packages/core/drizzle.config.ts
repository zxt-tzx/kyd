import type { Config } from "drizzle-kit";
import { defineConfig } from "drizzle-kit";
import { Resource } from "sst";

const connection = {
  user: Resource.Postgres.username,
  password: Resource.Postgres.password,
  host: Resource.Postgres.host,
  database: Resource.Postgres.database,
};
export default defineConfig({
  strict: true,
  verbose: true,
  dialect: "postgresql",
  dbCredentials: {
    url: `postgresql://${connection.user}:${connection.password}@${connection.host}/${connection.database}`,
  },
  schema: "src/**/*.sql.ts",
  out: "migrations",
} satisfies Config);
