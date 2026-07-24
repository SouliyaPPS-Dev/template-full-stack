import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCategories, useSettings } from "../hooks/useQueries";
import { useResponsive } from "../hooks/useResponsive";
import { User } from "../types";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
} from "../theme";

interface Props {
  user: User | null;
  onLogout: () => void;
}

export default function HomeScreen({ user, onLogout }: Props) {
  const navigation = useNavigation();
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: settings } = useSettings();
  const { isDesktop, isTablet, columns, width } = useResponsive();

  const storeName =
    settings?.find((s) => s.setting_key === "store_name")?.setting_value?.replace(/"/g, "") ||
    "Template";

  const horizontalPadding = isDesktop ? 40 : isTablet ? 24 : Spacing.xl;

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}>
      <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
        <Text style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}>
          Welcome to {storeName}
        </Text>
        <Text style={[styles.heroSubtitle, isDesktop && styles.heroSubtitleDesktop]}>
          Your one-stop e-commerce shop
        </Text>
        <View style={[styles.heroButtons, isDesktop && styles.heroButtonsDesktop]}>
          <TouchableOpacity
            style={[styles.primaryButton, isDesktop && styles.primaryButtonDesktop]}
            onPress={() => navigation.navigate("Products" as never)}
          >
            <Text style={styles.primaryButtonText}>Browse Products</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.outlineButton, isDesktop && styles.outlineButtonDesktop]}
            onPress={() => navigation.navigate("Orders" as never)}
          >
            <Text style={styles.outlineButtonText}>My Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.outlineButton, isDesktop && styles.outlineButtonDesktop]}
            onPress={() => navigation.navigate("Profile" as never)}
          >
            <Text style={styles.outlineButtonText}>My Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Categories</Text>
        {loadingCategories ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : categories && categories.length > 0 ? (
          <View style={[styles.categoryGrid, { justifyContent: isDesktop ? "center" : "flex-start" }]}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryCard,
                  { width: isDesktop ? `${100 / columns - 2}%` : isTablet ? "30%" : "45%" },
                ]}
                onPress={() => navigation.navigate("Products" as never)}
              >
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No categories yet</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why Shop With Us</Text>
        <View style={isDesktop ? styles.featureRow : undefined}>
          <View style={[styles.featureCard, isDesktop && styles.featureCardDesktop]}>
            <Text style={styles.featureTitle}>Wide Selection</Text>
            <Text style={styles.featureDesc}>
              Browse through our curated collection of products.
            </Text>
          </View>
          <View style={[styles.featureCard, isDesktop && styles.featureCardDesktop]}>
            <Text style={styles.featureTitle}>Easy Shopping</Text>
            <Text style={styles.featureDesc}>
              Add items to your cart and checkout in seconds.
            </Text>
          </View>
          <View style={[styles.featureCard, isDesktop && styles.featureCardDesktop]}>
            <Text style={styles.featureTitle}>Best Prices</Text>
            <Text style={styles.featureDesc}>
              Competitive pricing with regular promotions.
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  hero: { alignItems: "center", paddingVertical: 32 },
  heroDesktop: { paddingVertical: 48 },
  heroTitle: {
    fontSize: FontSize.hero,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
    textAlign: "center",
  },
  heroTitleDesktop: { fontSize: 36 },
  heroSubtitle: { fontSize: FontSize.lg, color: Colors.textSecondary, textAlign: "center" },
  heroSubtitleDesktop: { fontSize: FontSize.xl },
  heroButtons: { marginTop: Spacing.sm, width: "100%" },
  heroButtonsDesktop: { flexDirection: "row", justifyContent: "center", gap: 16, width: "auto" },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  primaryButtonDesktop: {
    marginBottom: 0,
    minWidth: 180,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  outlineButtonDesktop: {
    minWidth: 180,
  },
  outlineButtonText: {
    color: Colors.primary,
    fontSize: FontSize.lg,
    fontWeight: Platform.OS === "android" ? "600" : "600",
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: Platform.OS === "android" ? "600" : "600",
  },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
    marginBottom: Spacing.md,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryCard: {
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginBottom: 8,
  },
  categoryName: { fontSize: FontSize.md, fontWeight: Platform.OS === "android" ? "600" : "600", color: Colors.primary },
  emptyText: { color: Colors.textMuted, textAlign: "center", marginTop: 20 },
  featureRow: { flexDirection: "row", gap: 12 },
  featureCard: {
    backgroundColor: Colors.cardBg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  featureCardDesktop: {
    flex: 1,
    marginBottom: 0,
  },
  featureTitle: { fontSize: FontSize.lg, fontWeight: Platform.OS === "android" ? "600" : "600", marginBottom: Spacing.xs },
  featureDesc: { fontSize: FontSize.sm, color: Colors.textSecondary },
  logoutButton: {
    paddingVertical: 14,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: "center",
  },
  logoutText: { color: Colors.error, fontSize: FontSize.lg, fontWeight: Platform.OS === "android" ? "600" : "600" },
});
