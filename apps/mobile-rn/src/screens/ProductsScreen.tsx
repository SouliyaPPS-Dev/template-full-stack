import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useProducts } from "../hooks/useQueries";
import { useResponsive } from "../hooks/useResponsive";
import ProductCard from "../components/ProductCard";
import { Colors, Spacing, BorderRadius, FontSize } from "../theme";

export default function ProductsScreen() {
  const { data: products, isLoading, error } = useProducts();
  const [search, setSearch] = useState("");
  const { isDesktop, isTablet, columns, width } = useResponsive();

  const filtered = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  const horizontalPadding = isDesktop ? 40 : isTablet ? 24 : Spacing.lg;
  const gridColumns = isDesktop ? columns : isTablet ? 2 : 1;

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <View style={styles.errorIcon}>
          <Text style={styles.errorIconText}>!</Text>
        </View>
        <Text style={styles.errorText}>Failed to load products</Text>
        <Text style={styles.errorHint}>Check your connection and try again.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <Text style={styles.title}>Products</Text>
        <View style={styles.countBadge}>
          <Text style={styles.count}>{filtered?.length ?? 0} items</Text>
        </View>
      </View>

      <View style={[styles.searchContainer, { paddingHorizontal: horizontalPadding }]}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={Colors.placeholder}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingHorizontal: horizontalPadding }]}
        numColumns={gridColumns}
        key={`grid-${gridColumns}`}
        columnWrapperStyle={gridColumns > 1 ? styles.row : undefined}
        renderItem={({ item }) => (
          <ProductCard product={item} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🛍️</Text>
            <Text style={styles.emptyText}>
              {search ? `No products match "${search}"` : "No products yet"}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: FontSize.title,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
    color: Colors.text,
  },
  countBadge: {
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  count: { fontSize: 13, color: Colors.primary, fontWeight: "600" },
  searchContainer: {
    paddingVertical: Spacing.md,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: 12,
    fontSize: FontSize.md,
    backgroundColor: Colors.surface,
    color: Colors.text,
  },
  list: { paddingVertical: Spacing.md, paddingBottom: 40 },
  row: {
    justifyContent: "flex-start",
    gap: 12,
  },
  errorIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.error,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  errorIconText: { color: Colors.white, fontSize: 28, fontWeight: "700" },
  errorText: { color: Colors.error, fontSize: FontSize.lg, fontWeight: "600" },
  errorHint: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 4 },
  empty: { alignItems: "center", paddingTop: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: Spacing.sm },
  emptyText: { color: Colors.textMuted, textAlign: "center", fontSize: FontSize.lg },
});
