import type { DbClient } from "./db";
import type { InsertDev } from "./db/schema/entities/dev.sql";
import { devs } from "./db/schema/entities/dev.sql";
import type { InsertQuery } from "./db/schema/entities/query.sql";
import { queries } from "./db/schema/entities/query.sql";
import { conflictUpdateOnly } from "./db/utils/conflict";

export async function createNewQuery({
  query,
  dev,
  db,
}: {
  query: Omit<InsertQuery, "devId">;
  dev: InsertDev;
  db: DbClient;
}) {
  const [res] = await db.transaction(async (tx) => {
    const [res] = await tx
      .insert(devs)
      .values({
        ...dev,
      })
      .onConflictDoUpdate({
        target: [devs.nodeId],
        set: conflictUpdateOnly(devs, [
          "login",
          "name",
          "email",
          "avatarUrl",
          "htmlUrl",
          "company",
          "location",
          "bio",
        ]),
      })
      .returning({
        devId: devs.id,
      });
    if (!res) {
      throw new Error("Failed to insert dev");
    }
    const { devId } = res;
    return await db
      .insert(queries)
      .values({
        devId,
        ...query,
      })
      .returning({
        queryId: queries.id,
      });
  });
  if (!res) {
    throw new Error("Failed to create new query");
  }
  return res.queryId;
}
