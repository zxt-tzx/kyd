export const secret = {
  openaiApiKey: new sst.Secret("OPENAI_API_KEY"),
  deepseekApiKey: new sst.Secret("DEEPSEEK_API_KEY"),
  serperApiKey: new sst.Secret("SERPER_API_KEY"),
  braveApiKey: new sst.Secret("BRAVE_API_KEY"),
  databaseUrl: new sst.Secret("DATABASE_URL"),
};

export const allSecrets = Object.values(secret);

export const outputs = {};
