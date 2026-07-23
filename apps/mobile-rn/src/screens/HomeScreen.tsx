import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useCategories, useSettings } from "../hooks/useQueries";
import { User } from "../types";

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
  container: { flex: 1, backgroundColor: "#fff" },
  content: { paddingBottom: 40 },
  hero: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 20 },
  heroTitle: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 8 },
  heroSubtitle: { fontSize: 16, color: "#666", textAlign: "center", marginBottom: 24 },
  heroButtons: { gap: 12, width: "100%" },
  primaryButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  outlineButton: {
    borderWidth: 1,
    borderColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  outlineButtonText: { color: "#2563eb", fontSize: 16, fontWeight: "600" },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  categoryCard: {
    backgroundColor: "#f0f4ff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 10,
    minWidth: "45%",
    alignItems: "center",
  },
  categoryName: { fontSize: 14, fontWeight: "600", color: "#2563eb" },
  emptyText: { color: "#999", textAlign: "center", marginTop: 20 },
  featureCard: {
    backgroundColor: "#fafafa",
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
  },
  featureTitle: { fontSize: 15, fontWeight: "600", marginBottom: 4 },
  featureDesc: { fontSize: 13, color: "#666" },
  logoutButton: {
    marginHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dc2626",
    alignItems: "center",
  },
  logoutText: { color: "#dc2626", fontSize: 16, fontWeight: "600" },
});
