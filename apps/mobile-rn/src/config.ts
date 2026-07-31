import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? (Constants.manifest as any)?.extra ?? {};

const DEV_PORT = "8080";
const PROD_API = "https://souliya-template.hf.space/api/v1";

function detectDevHost(): string {
  if (typeof window !== "undefined" && window.location?.hostname) {
    return window.location.hostname;
  }
  const hostUri =
    (Constants.expoConfig as any)?.hostUri ||
    (Constants.manifest2 as any)?.extra?.expoClient?.hostUri ||
    (Constants.manifest as any)?.debuggerHost ||
    (Constants.manifest as any)?.hostUri;
  const host = typeof hostUri === "string" ? hostUri.split(":")[0] : "";
  return host || "localhost";
}

const appEnv = (extra.appEnv as string) || "development";
const envApiUrl = (extra.apiUrl as string)?.trim();
const apiUrl =
  envApiUrl ||
  (appEnv === "production" ? PROD_API : `http://${detectDevHost()}:${DEV_PORT}/api/v1`);

export const Config = {
  apiUrl,
  appEnv,
  isDev: appEnv !== "production",
  isProd: appEnv === "production",
  appName: (extra.appName as string) || "Template",
};
