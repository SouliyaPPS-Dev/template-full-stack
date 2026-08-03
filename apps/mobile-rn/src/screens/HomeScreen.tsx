import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Image,
  RefreshControl,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useCategories, useSettings, useProducts } from "../hooks/useQueries";
import { useResponsive } from "../hooks/useResponsive";
import { User } from "../types";
import { Colors, Spacing, BorderRadius, FontSize } from "../theme";

interface Props {
  user: User | null;
}

const categoryEmoji = ["🏠", "🍽️", "👗", "📱", "🧸", "📚", "⚡", "🛠️", "🧴", "🚗"];

export default function HomeScreen({ user }: Props) {
  const navigation = useNavigation();
  const categories = useCategories();
  const settings = useSettings();
  const products = useProducts();
  const { isDesktop, isTablet } = useResponsive();
  const [refreshing, setRefreshing] = useState(false);

  const storeName =
    settings.data?.find((s) => s.key === "store_name")?.value || "Template";
  const storeLogo = settings.data?.find((s) => s.key === "store_logo")?.value || "";

  const featured = products.data?.filter((p) => p.is_featured && p.is_active).slice(0, 8) || [];
  const horizontalPadding = isDesktop ? 40 : isTablet ? 24 : Spacing.xl;
  const contentMaxWidth = isDesktop ? 1200 : undefined;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        categories.refetch(),
        settings.refetch(),
        products.refetch(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [categories, settings, products]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />
      }
    >
      <View style={[styles.inner, contentMaxWidth ? { maxWidth: contentMaxWidth, width: "100%", alignSelf: "center" } : undefined]}>
        {/* Hero */}
        <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
          <View style={styles.heroGlow} />
          {storeLogo ? (
            <Image
              source={{ uri: storeLogo }}
              style={[styles.heroLogo, isDesktop && styles.heroLogoDesktop]}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.heroLogo, isDesktop && styles.heroLogoDesktop]}>
              <MaterialCommunityIcons name="storefront" size={34} color={Colors.primary} />
            </View>
          )}
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>🛒 Shop online</Text>
          </View>
          <Text style={[styles.heroTitle, isDesktop && styles.heroTitleDesktop]}>
            {settings.isLoading ? "Welcome!" : `Welcome to ${storeName}`}
          </Text>
          <Text style={[styles.heroSubtitle, isDesktop && styles.heroSubtitleDesktop]}>
            Your one-stop shop for quality products at the best prices.
          </Text>
          <View style={[styles.heroButtons, isDesktop && styles.heroButtonsDesktop]}>
            <TouchableOpacity
              style={[styles.primaryButton, isDesktop && styles.heroButtonWide]}
              onPress={() => navigation.navigate("Products" as never)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryButtonText}>Browse Products</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.secondaryButton, isDesktop && styles.heroButtonWide]}
              onPress={() => navigation.navigate("Orders" as never)}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryButtonText}>My Orders</Text>
            </TouchableOpacity>
          </View>
          {user && (
            <View style={styles.heroUserPill}>
              <Text style={styles.heroUserText}>Signed in as {user.full_name}</Text>
            </View>
          )}
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Products" as never)} activeOpacity={0.7}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {categories.isLoading ? (
            <ActivityIndicator style={{ marginTop: 16 }} color={Colors.primary} />
          ) : categories.data && categories.data.length > 0 ? (
            <View style={styles.categoryGrid}>
              {categories.data.map((cat, i) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    { width: isDesktop ? "18%" : isTablet ? "30%" : "45%" },
                  ]}
                  onPress={() => navigation.navigate("Products" as never)}
                  activeOpacity={0.8}
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
            <TouchableOpacity onPress={() => navigation.navigate("Products" as never)} activeOpacity={0.7}>
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
                  activeOpacity={0.85}
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
    overflow: "hidden",
    shadowColor: "#4f46e5",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  heroDesktop: { paddingVertical: 48, paddingHorizontal: 48 },
  heroGlow: {
    position: "absolute",
    top: -80,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  heroLogo: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  heroLogoDesktop: { width: 76, height: 76 },
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
  heroUserPill: {
    marginTop: Spacing.lg,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  heroUserText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: "500" },
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
});
