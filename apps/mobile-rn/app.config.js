const DEV_API = "http://10.238.134.232:8080/api/v1";
const PROD_API = "https://souliya-template.hf.space/api/v1";

module.exports = ({ config }) => {
  const appEnv = process.env.APP_ENV || "development";
  const apiUrl = process.env.API_URL || (appEnv === "production" ? PROD_API : DEV_API);

  return {
    ...config,
    extra: {
      ...config.extra,
      apiUrl,
      appEnv,
      appName: process.env.APP_NAME || config.extra?.appName || "Template",
    },
  };
};
