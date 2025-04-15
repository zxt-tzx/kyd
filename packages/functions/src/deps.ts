import { Resource } from "sst";

import { createDb } from "@/core/db";

export function getDeps() {
  const currStage = Resource.App.stage;
  const { db } = createDb({
    connectionString: Resource.DATABASE_URL.value,
    useLogger: currStage !== "prod",
    // useLogger: false,
  });

  return {
    currStage,
    db,
  };
}
