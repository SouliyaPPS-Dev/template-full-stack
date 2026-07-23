require("dotenv/config");

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    apiUrl: process.env.API_URL || "http://localhost:8080/api/v1",
    appName: process.env.APP_NAME || "MyStore",
  },
});
