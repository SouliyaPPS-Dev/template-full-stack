const PROD_API = "https://souliya-template.hf.space/api/v1";

module.exports = ({ config }) => {
  const appEnv = process.env.APP_ENV || "development";
  const apiUrl = process.env.API_URL || (appEnv === "production" ? PROD_API : undefined);

  return {
    ...config,
    extra: {
      ...config.extra,
      ...(apiUrl ? { apiUrl } : {}),
      appEnv,
      appName: process.env.APP_NAME || config.extra?.appName || "Template",
    },
  };
};
