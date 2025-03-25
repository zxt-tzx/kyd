export const domain =
  {
    prod: "kyd.theintel.io",
    stg: "stg.kyd.theintel.io",
  }[$app.stage] || $app.stage + ".stg.kyd.theintel.io";

// export const outputs = {
//   domain,
// };
