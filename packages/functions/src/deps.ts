import { Resource } from "sst";

export function getDeps() {
  const currStage = Resource.App.stage;
  // connectionString: Resource.DATABASE_URL.value,
  // const { db } = createDb({
  //   useLogger: currStage !== "prod",
  //   // useLogger: false,
  // });

  return {
    currStage,
  };
}
