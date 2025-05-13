export type Stage = "stg" | "prod" | (string & {});

export function isDeployedStage(currStage: string) {
  return currStage === "stg" || currStage === "prod" || currStage === "uat";
}

export function isDevStage(currStage: string) {
  return !isDeployedStage(currStage);
}

export function getUrl(stage: string) {
  switch (stage) {
    case "stg":
      return "https://stg.kyd.theintel.io";
    case "prod":
      return "https://kyd.theintel.io";
    default:
      return "https://local.kyd.theintel.io:3000";
  }
}
