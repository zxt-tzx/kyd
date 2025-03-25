// export const vpc = ["stg", "prod"].includes($app.stage)
//   ? new sst.aws.Vpc("VPC", {
//       az: 2,
//       bastion: true,
//     })
//   : sst.aws.Vpc.get("VPC", "vpc-0a84284d755f87363");
