import { Platform } from "react-native";
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? (Constants.manifest as any)?.extra ?? {};

const FALLBACK_URL = Platform.select({
  android: "http://10.30.242.232:8080/api/v1",
  ios: "http://10.30.242.232:8080/api/v1",
  default: "http://localhost:8080/api/v1",
});

export const Config = {
  apiUrl: (extra.apiUrl as string) || FALLBACK_URL,
  appName: (extra.appName as string) || "Template",
};
