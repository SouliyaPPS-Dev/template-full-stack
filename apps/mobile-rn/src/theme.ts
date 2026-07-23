import { Platform, TextStyle, ViewStyle } from "react-native";

export const Colors = {
  primary: "#2563eb",
  primaryLight: "#e0e7ff",
  primaryBg: "#f0f4ff",
  white: "#fff",
  background: "#fff",
  cardBg: "#fafafa",
  text: "#000",
  textSecondary: "#666",
  textMuted: "#999",
  border: "#ddd",
  borderLight: "#eee",
  error: "#dc2626",
  success: "#16a34a",
  disabled: "#ccc",
  placeholder: "#999",
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
  sm: 8,
  md: 10,
  lg: 12,
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

const platformBold = Platform.select<TextStyle>({
  ios: { fontWeight: "600" as TextStyle["fontWeight"] },
  android: { fontWeight: "700" as TextStyle["fontWeight"] },
  default: { fontWeight: "600" as TextStyle["fontWeight"] },
});

const platformBoldHeavy = Platform.select<TextStyle>({
  ios: { fontWeight: "bold" as TextStyle["fontWeight"] },
  android: { fontWeight: "700" as TextStyle["fontWeight"] },
  default: { fontWeight: "bold" as TextStyle["fontWeight"] },
});

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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
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
  borderRadius: BorderRadius.sm,
  alignItems: "center",
};

export const ButtonOutline: ViewStyle = {
  borderWidth: 1,
  borderColor: Colors.primary,
  paddingVertical: 14,
  borderRadius: BorderRadius.sm,
  alignItems: "center",
};

export const ButtonDanger: ViewStyle = {
  marginHorizontal: Spacing.xl,
  paddingVertical: 14,
  borderRadius: BorderRadius.sm,
  borderWidth: 1,
  borderColor: Colors.error,
  alignItems: "center",
};

export const Input: TextStyle = {
  borderWidth: 1,
  borderColor: Colors.border,
  borderRadius: BorderRadius.sm,
  padding: 14,
  fontSize: FontSize.lg,
  marginBottom: Spacing.md,
  backgroundColor: Colors.white,
};

export const Card: ViewStyle = {
  marginHorizontal: Spacing.lg,
  marginBottom: Spacing.lg,
  backgroundColor: Colors.cardBg,
  borderRadius: BorderRadius.lg,
  padding: Spacing.lg,
};
