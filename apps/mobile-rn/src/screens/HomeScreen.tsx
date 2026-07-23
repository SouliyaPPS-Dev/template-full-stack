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

  const storeName =
    settings?.find((s) => s.setting_key === "store_name")?.setting_value?.replace(/"/g, "") ||
    "MyStore";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Welcome to {storeName}</Text>
        <Text style={styles.heroSubtitle}>
          Full-stack e-commerce mobile app
        </Text>
        <View style={styles.heroButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("Products" as never)}
          >
            <Text style={styles.primaryButtonText}>Browse Products</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.outlineButton}
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
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryCard}
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
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Wide Selection</Text>
          <Text style={styles.featureDesc}>
            Browse through our curated collection of products.
          </Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Easy Shopping</Text>
          <Text style={styles.featureDesc}>
            Add items to your cart and checkout in seconds.
          </Text>
        </View>
        <View style={styles.featureCard}>
          <Text style={styles.featureTitle}>Best Prices</Text>
          <Text style={styles.featureDesc}>
            Competitive pricing with regular promotions.
          </Text>
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
  hero: { alignItems: "center", paddingVertical: 32, paddingHorizontal: Spacing.xl },
  heroTitle: {
    fontSize: FontSize.hero,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
    textAlign: "center",
  },
  heroSubtitle: { fontSize: FontSize.lg, color: Colors.textSecondary, textAlign: "center" },
  heroButtons: { marginTop: Spacing.sm, width: "100%" },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  primaryButtonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: Platform.OS === "android" ? "600" : "600",
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  outlineButtonText: {
    color: Colors.primary,
    fontSize: FontSize.lg,
    fontWeight: Platform.OS === "android" ? "600" : "600",
  },
  section: { paddingHorizontal: Spacing.xl, marginBottom: 24 },
  sectionTitle: {
    fontSize: FontSize.xxl,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
    marginBottom: Spacing.md,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.sm / 2,
  },
  categoryCard: {
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    minWidth: "45%",
    alignItems: "center",
    margin: Spacing.sm / 2,
  },
  categoryName: { fontSize: FontSize.md, fontWeight: Platform.OS === "android" ? "600" : "600", color: Colors.primary },
  emptyText: { color: Colors.textMuted, textAlign: "center", marginTop: 20 },
  featureCard: {
    backgroundColor: Colors.cardBg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  featureTitle: { fontSize: FontSize.lg, fontWeight: Platform.OS === "android" ? "600" : "600", marginBottom: Spacing.xs },
  featureDesc: { fontSize: FontSize.sm, color: Colors.textSecondary },
  logoutButton: {
    marginHorizontal: Spacing.xl,
    paddingVertical: 14,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: "center",
  },
  logoutText: { color: Colors.error, fontSize: FontSize.lg, fontWeight: Platform.OS === "android" ? "600" : "600" },
});
