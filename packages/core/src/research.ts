import type { DbClient } from "./db";
import type { InsertDev } from "./db/schema/entities/dev.sql";
import { devs } from "./db/schema/entities/dev.sql";
import type { InsertResearch } from "./db/schema/entities/research.sql";
import { researches } from "./db/schema/entities/research.sql";
import { conflictUpdateOnly } from "./db/utils/conflict";
import { nanoid } from "./util/nanoid";

export async function createNewResearch({
  research,
  dev,
  db,
}: {
  research: Omit<InsertResearch, "devId" | "nanoId">;
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
    return await tx
      .insert(researches)
      .values({
        devId,
        nanoId: nanoid(),
        ...research,
      })
      .returning({
        nanoId: researches.nanoId,
      });
  });
  if (!res) {
    throw new Error("Failed to create new research");
  }
  return res.nanoId;
}
