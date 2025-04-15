const cloudflareSecretKey = new random.RandomString("CloudflareSecretKey", {
  special: false,
  length: 64,
});

const keys = new sst.Linkable("Keys", {
  properties: {
    cloudflareSecretKey: cloudflareSecretKey.result,
  },
});

export const secret = {
  openaiApiKey: new sst.Secret("OPENAI_API_KEY"),
  deepseekApiKey: new sst.Secret("DEEPSEEK_API_KEY"),
  serperApiKey: new sst.Secret("SERPER_API_KEY"),
  braveApiKey: new sst.Secret("BRAVE_API_KEY"),
  // currently DATABASE_URL uses the Supabase shared pooler
  // for lower latency, we need to figure out how to use Supabase dedicated pooler (ipv6)
  // OR pay extra to use the IPv4 address
  // alternatively, move to AWS RDS / RDS Aurora
  databaseUrl: new sst.Secret("DATABASE_URL"),
  keys,
};

export const allSecrets = Object.values(secret);

export const outputs = {};
