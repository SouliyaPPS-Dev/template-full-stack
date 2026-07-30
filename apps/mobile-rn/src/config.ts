import { Platform } from "react-native";
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? (Constants.manifest as any)?.extra ?? {};

const FALLBACK_URL = Platform.select({
  android: "http://10.238.134.232:8080/api/v1",
  ios: "http://10.238.134.232:8080/api/v1",
  default: "http://localhost:8080/api/v1",
});

const apiUrl = (extra.apiUrl as string) || FALLBACK_URL;
const appEnv = (extra.appEnv as string) || "development";

export const Config = {
  apiUrl,
  appEnv,
  isDev: appEnv !== "production",
  isProd: appEnv === "production",
  appName: (extra.appName as string) || "Template",
};
