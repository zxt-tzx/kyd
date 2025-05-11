export type Stage = "stg" | "prod" | (string & {});

export function isDeployedStage(currStage: string) {
  return currStage === "stg" || currStage === "prod" || currStage === "uat";
}

export function isDevStage(currStage: string) {
  return !isDeployedStage(currStage);
}
