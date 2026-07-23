export const config = {
  api: {
    baseUrl: "http://localhost:8080",
    timeout: 30000,
  },
  database: {
    host: "localhost",
    port: 5432,
    name: "app_main",
    user: "app_user",
    password: "app_pass",
  },
  jwt: {
    secret: "change-me",
    expireMinutes: 60,
  },
  app: {
    name: "MyStore",
    currency: "LAK",
    taxPercent: 7,
  },
} as const;

export type Config = typeof config;
