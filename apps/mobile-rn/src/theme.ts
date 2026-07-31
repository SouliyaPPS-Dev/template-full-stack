import { Platform, TextStyle, ViewStyle } from "react-native";

export const Colors = {
  primary: "#4f46e5",
  primaryDark: "#4338ca",
  primaryLight: "#e0e7ff",
  primaryBg: "#eef2ff",
  violet: "#8b5cf6",
  white: "#fff",
  background: "#fafafc",
  surface: "#ffffff",
  cardBg: "#f7f7fa",
  text: "#0f172a",
  textSecondary: "#64748b",
  textMuted: "#94a3b8",
  border: "#e2e8f0",
  borderLight: "#eef2f7",
  error: "#dc2626",
  warning: "#d97706",
  success: "#16a34a",
  disabled: "#cbd5e1",
  placeholder: "#94a3b8",
  overlay: "rgba(15, 23, 42, 0.5)",
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 999,
};

export const FontSize = {
  xs: 12,
  sm: 13,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  title: 22,
  hero: 28,
  logo: 36,
};

const fontWeightNormal = Platform.OS === "android" ? "400" : "normal";
const fontWeightMedium = Platform.OS === "android" ? "500" : "500";
const fontWeightSemibold = Platform.OS === "android" ? "600" : "600";
const fontWeightBold = Platform.OS === "android" ? "700" : "bold";

const platformBold: TextStyle = { fontWeight: fontWeightSemibold as TextStyle["fontWeight"] };
const platformBoldHeavy: TextStyle = { fontWeight: fontWeightBold as TextStyle["fontWeight"] };

export const Typography: Record<string, TextStyle> = {
  logo: { ...platformBoldHeavy, fontSize: FontSize.logo, color: Colors.primary },
  heroTitle: { ...platformBoldHeavy, fontSize: FontSize.hero, textAlign: "center" },
  heroSubtitle: { fontSize: FontSize.lg, color: Colors.textSecondary, textAlign: "center" },
  sectionTitle: { ...platformBoldHeavy, fontSize: FontSize.xxl },
  title: { ...platformBoldHeavy, fontSize: FontSize.title },
  subtitle: { fontSize: FontSize.lg, color: Colors.textSecondary, marginTop: Spacing.sm },
  body: { fontSize: FontSize.lg },
  bodySecondary: { fontSize: FontSize.md, color: Colors.textSecondary },
  bodyMuted: { fontSize: FontSize.md, color: Colors.textMuted },
  label: { fontSize: FontSize.md, color: Colors.textSecondary },
  value: { fontSize: FontSize.md, ...platformBold },
  small: { fontSize: FontSize.xs, color: Colors.textMuted },
  smallSecondary: { fontSize: FontSize.xs, color: Colors.textSecondary },
  price: { fontSize: FontSize.xl, ...platformBoldHeavy, color: Colors.primary },
  comparePrice: { fontSize: FontSize.md, color: Colors.textMuted, textDecorationLine: "line-through" },
  buttonText: { ...platformBold, color: Colors.white, fontSize: FontSize.lg },
  error: { color: Colors.error, fontSize: FontSize.md },
  success: { color: Colors.success, fontSize: FontSize.md, textAlign: "center" },
  link: { color: Colors.primary, textAlign: "center", marginTop: Spacing.lg, fontSize: FontSize.md },
  emptyText: { color: Colors.textMuted, textAlign: "center", fontSize: FontSize.lg },
};

export const CardShadow: ViewStyle = Platform.select({
  ios: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  android: {
    elevation: 4,
  },
  default: {
    elevation: 4,
  },
}) as ViewStyle;

export const CardShadowSoft: ViewStyle = Platform.select({
  ios: {
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  android: {
    elevation: 2,
  },
  default: {
    elevation: 2,
  },
}) as ViewStyle;

export const ButtonPrimary: ViewStyle = {
  backgroundColor: Colors.primary,
  paddingVertical: 14,
  paddingHorizontal: Spacing.xl,
  borderRadius: BorderRadius.md,
  alignItems: "center",
  justifyContent: "center",
  shadowColor: "#4f46e5",
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.25,
  shadowRadius: 8,
  elevation: 4,
};

export const ButtonOutline: ViewStyle = {
  borderWidth: 1,
  borderColor: Colors.primary,
  paddingVertical: 14,
  paddingHorizontal: Spacing.xl,
  borderRadius: BorderRadius.md,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: Colors.white,
};

export const ButtonDanger: ViewStyle = {
  marginHorizontal: Spacing.xl,
  paddingVertical: 14,
  borderRadius: BorderRadius.md,
  borderWidth: 1,
  borderColor: Colors.error,
  alignItems: "center",
};

export const Input: TextStyle = {
  borderWidth: 1,
  borderColor: Colors.border,
  borderRadius: BorderRadius.md,
  padding: 14,
  fontSize: FontSize.lg,
  marginBottom: Spacing.md,
  backgroundColor: Colors.white,
};

export const Card: ViewStyle = {
  marginHorizontal: Spacing.lg,
  marginBottom: Spacing.lg,
  backgroundColor: Colors.surface,
  borderRadius: BorderRadius.lg,
  padding: Spacing.lg,
  borderWidth: 1,
  borderColor: Colors.borderLight,
};
