import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  useHealthCheck,
  useCategories,
  useSettings,
  useProducts,
  useTestEndpoints,
} from "../hooks/useQueries";
import { useResponsive } from "../hooks/useResponsive";
import { Config } from "../config";
import { User } from "../types";
import { Colors, Spacing, BorderRadius, FontSize } from "../theme";

interface Props {
  user: User | null;
  onLogout: () => void;
}

const categoryEmoji = ["🏠", "🍽️", "👗", "📱", "🧸", "📚", "⚡", "🛠️", "🧴", "🚗"];

export default function HomeScreen({ user, onLogout }: Props) {
  const navigation = useNavigation();
  const { data: categories, isLoading: loadingCategories } = useCategories();
  const { data: settings, isLoading: loadingSettings } = useSettings();
  const { data: products } = useProducts();
  const { data: health } = useHealthCheck();
  const { isDesktop, isTablet } = useResponsive();
  const [showTests, setShowTests] = useState(false);
  const { data: testResults, isLoading: testing, refetch: runTests } = useTestEndpoints();

  const storeName =
    settings?.find((s) => s.setting_key === "store_name")?.setting_value?.replace(/"/g, "") ||
    "Template";

  const featured = products?.filter((p) => p.is_featured && p.is_active).slice(0, 8) || [];
  const horizontalPadding = isDesktop ? 40 : isTablet ? 24 : Spacing.xl;
  const contentMaxWidth = isDesktop ? 1200 : undefined;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
    >
      <View style={[styles.inner, contentMaxWidth ? { maxWidth: contentMaxWidth, width: "100%", alignSelf: "center" } : undefined]}>        {/* Hero */}
        <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>🛒 Shop online</Text>
          </View>
          <Text style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}>
            {loadingSettings ? "Welcome!" : `Welcome to ${storeName}`}
          </Text>
          <Text style={[styles.heroSubtitle, isDesktop && styles.heroSubtitleDesktop]}>
            Your one-stop shop for quality products at the best prices.
          </Text>
          <View style={[styles.heroButtons, isDesktop && styles.heroButtonsDesktop]}>
            <TouchableOpacity
              style={[styles.primaryButton, isDesktop && styles.heroButtonWide]}
              onPress={() => navigation.navigate("Products" as never)}
            >
              <Text style={styles.primaryButtonText}>Browse Products</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, isDesktop && styles.heroButtonWide]}
              onPress={() => navigation.navigate("Orders" as never)}
            >
              <Text style={styles.secondaryButtonText}>My Orders</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Products" as never)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {loadingCategories ? (
            <ActivityIndicator style={{ marginTop: 16 }} color={Colors.primary} />
          ) : categories && categories.length > 0 ? (
            <View style={styles.categoryGrid}>
              {categories.map((cat, i) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    { width: isDesktop ? "18%" : isTablet ? "30%" : "45%" },
                  ]}
                  onPress={() => navigation.navigate("Products" as never)}
                >
                  <Text style={styles.categoryEmoji}>{categoryEmoji[i % categoryEmoji.length]}</Text>
                  <Text style={styles.categoryName} numberOfLines={1}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No categories yet</Text>
          )}
        </View>

        {/* Featured products */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Products" as never)}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {featured.length > 0 ? (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredRow}
            >
              {featured.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.featuredCard}
                  onPress={() => navigation.navigate("Products" as never)}
                >
                  <View style={styles.featuredImage}>
                    {p.images?.[0] ? (
                      <Image source={{ uri: p.images[0] }} style={styles.featuredImage} resizeMode="cover" />
                    ) : (
                      <Text style={styles.featuredEmoji}>📦</Text>
                    )}
                  </View>
                  <View style={styles.featuredInfo}>
                    <Text style={styles.featuredName} numberOfLines={1}>{p.name}</Text>
                    <Text style={styles.featuredPrice}>₭{Math.round(p.selling_price).toLocaleString()}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text style={styles.emptyText}>No featured products yet</Text>
          )}
        </View>

        {/* Why shop with us */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Shop With Us</Text>
          <View style={isDesktop ? styles.featureRow : undefined}>
            <View style={[styles.featureCard, isDesktop && styles.featureCardDesktop]}>
              <Text style={styles.featureEmoji}>🛍️</Text>
              <Text style={styles.featureTitle}>Wide Selection</Text>
              <Text style={styles.featureDesc}>
                Browse through our curated collection of products.
              </Text>
            </View>
            <View style={[styles.featureCard, isDesktop && styles.featureCardDesktop]}>
              <Text style={styles.featureEmoji}>⚡</Text>
              <Text style={styles.featureTitle}>Easy Shopping</Text>
              <Text style={styles.featureDesc}>
                Add items to your cart and checkout in seconds.
              </Text>
            </View>
            <View style={[styles.featureCard, isDesktop && styles.featureCardDesktop]}>
              <Text style={styles.featureEmoji}>🏷️</Text>
              <Text style={styles.featureTitle}>Best Prices</Text>
              <Text style={styles.featureDesc}>
                Competitive pricing with regular promotions.
              </Text>
            </View>
          </View>
        </View>

        {/* Developer tools */}
        <View style={styles.devCard}>
          <View style={styles.devHeader}>
            <View>
              <Text style={styles.devTitle}>Developer Tools</Text>
              <Text style={styles.devSubtitle}>
                {Config.isProd ? "PRODUCTION" : "DEVELOPMENT"} · {Config.apiUrl}
              </Text>
            </View>
            <View style={[styles.statusPill, { backgroundColor: health ? "#ecfdf5" : "#fef2f2" }]}>
              <View style={[styles.statusDot, { backgroundColor: health ? Colors.success : Colors.error }]} />
              <Text style={[styles.statusText, { color: health ? Colors.success : Colors.error }]}>
                {health ? "API OK" : "checking..."}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.testButton}
            onPress={() => { setShowTests(!showTests); if (!showTests && !testResults) runTests(); }}
          >
            <Text style={styles.testButtonText}>
              {showTests ? "Hide Endpoint Tests" : "Test All Endpoints"}
            </Text>
          </TouchableOpacity>
          {showTests && (
            testing ? (
              <ActivityIndicator style={{ marginTop: 12 }} color={Colors.primary} />
            ) : testResults ? (
              <View style={{ marginTop: Spacing.sm }}>
                {Object.entries(testResults).map(([name, res]: any) => (
                  <View
                    key={name}
                    style={[styles.endpointRow, { backgroundColor: res.ok ? "#f0fdf4" : "#fef2f2" }]}
                  >
                    <Text style={styles.endpointName} numberOfLines={1}>{name}</Text>
                    <Text style={{ color: res.ok ? Colors.success : Colors.error, fontWeight: "600" }}>
                      {res.ok ? "PASS" : "FAIL"}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null
          )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 48 },
  inner: { flex: 1 },
  hero: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    alignItems: "center",
    marginTop: Spacing.lg,
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  heroDesktop: { paddingVertical: 48, paddingHorizontal: 48 },
  heroBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  heroBadgeText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: "600" },
  heroTitle: {
    fontSize: FontSize.hero,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
    textAlign: "center",
    color: Colors.white,
  },
  heroTitleDesktop: { fontSize: 36 },
  heroSubtitle: { fontSize: FontSize.lg, color: "rgba(255,255,255,0.85)", textAlign: "center", marginTop: Spacing.sm },
  heroSubtitleDesktop: { fontSize: FontSize.xl },
  heroButtons: { marginTop: Spacing.xl, width: "100%" },
  heroButtonsDesktop: { flexDirection: "row", justifyContent: "center", gap: 16, width: "auto" },
  primaryButton: {
    backgroundColor: Colors.white,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  heroButtonWide: { minWidth: 180 },
  primaryButtonText: { color: Colors.primary, fontSize: FontSize.lg, fontWeight: Platform.OS === "android" ? "700" : "600" },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  secondaryButtonText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: Platform.OS === "android" ? "600" : "600" },
  section: { marginTop: Spacing.xxl },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.title,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  seeAll: { color: Colors.primary, fontSize: FontSize.md, fontWeight: "600", marginBottom: Spacing.md },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "flex-start", gap: 8 },
  categoryCard: {
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    marginBottom: 8,
  },
  categoryEmoji: { fontSize: 24, marginBottom: Spacing.xs },
  categoryName: { fontSize: FontSize.md, fontWeight: Platform.OS === "android" ? "600" : "600", color: Colors.primary },
  emptyText: { color: Colors.textMuted, textAlign: "center", marginTop: 20 },
  featuredRow: { paddingRight: Spacing.lg },
  featuredCard: {
    width: 180,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  featuredImage: {
    height: 110,
    backgroundColor: Colors.primaryBg,
    justifyContent: "center",
    alignItems: "center",
  },
  featuredEmoji: { fontSize: 32 },
  featuredInfo: { padding: Spacing.md },
  featuredName: { fontSize: FontSize.md, fontWeight: "600", color: Colors.text, marginBottom: Spacing.xs },
  featuredPrice: { fontSize: FontSize.lg, fontWeight: "700", color: Colors.primary },
  featureRow: { flexDirection: "row", gap: 12 },
  featureCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  featureCardDesktop: { flex: 1, marginBottom: 0 },
  featureEmoji: { fontSize: 22, marginBottom: Spacing.sm },
  featureTitle: { fontSize: FontSize.lg, fontWeight: Platform.OS === "android" ? "600" : "600", marginBottom: Spacing.xs, color: Colors.text },
  featureDesc: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 18 },
  devCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.xxl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  devHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  devTitle: { fontSize: FontSize.lg, fontWeight: "700", color: Colors.text },
  devSubtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusText: { fontSize: FontSize.xs, fontWeight: "600" },
  testButton: {
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 10,
    alignItems: "center",
  },
  testButtonText: { color: Colors.primary, fontSize: FontSize.md, fontWeight: "600" },
  endpointRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
    paddingHorizontal: Spacing.sm,
    borderRadius: 6,
    marginBottom: 4,
  },
  endpointName: { fontSize: FontSize.sm, color: Colors.text, flex: 1, marginRight: Spacing.sm },
  logoutButton: {
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: "center",
    marginTop: Spacing.xxl,
    backgroundColor: "#fef2f2",
  },
  logoutText: { color: Colors.error, fontSize: FontSize.lg, fontWeight: Platform.OS === "android" ? "600" : "600" },
});
