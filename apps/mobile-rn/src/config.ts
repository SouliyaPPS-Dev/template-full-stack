import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? Constants.manifest?.extra ?? {};

export const Config = {
  apiUrl: (extra.apiUrl as string) || "http://localhost:8080/api/v1",
  appName: (extra.appName as string) || "MyStore",
};
