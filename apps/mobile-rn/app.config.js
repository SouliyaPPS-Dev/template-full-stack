module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    apiUrl: process.env.API_URL || config.extra?.apiUrl || "http://10.30.242.232:8080/api/v1",
    appName: process.env.APP_NAME || config.extra?.appName || "Template",
  },
});
