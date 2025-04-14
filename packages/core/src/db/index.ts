import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

export * from "drizzle-orm";

export function createDb(config: {
  connectionString: string;
  useLogger: boolean;
  options?: postgres.Options<{}>;
}) {
  const client = postgres(config.connectionString, {
    // Disable prepare as it is not supported for "Transaction" pool mode
    prepare: false,
    ...config.options,
  });
  return {
    db: drizzle(client, {
      logger: config.useLogger,
    }),
    // used to close connection when running scripts
    closeConnection: async () => await client.end(),
  };
}

// TODO: Remove the cast once https://github.com/drizzle-team/drizzle-orm/issues/3175 is resolved
export type DbClient = Omit<ReturnType<typeof createDb>["db"], "$client">;
