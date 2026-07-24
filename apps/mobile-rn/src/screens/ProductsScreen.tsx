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
import { Product } from "../types";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
} from "../theme";

export default function ProductsScreen() {
  const { data: products, isLoading, error } = useProducts();
  const [search, setSearch] = useState("");
  const { isDesktop, isTablet, columns, width } = useResponsive();

  const filtered = products?.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

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
        <Text style={styles.errorText}>Failed to load products</Text>
      </View>
    );
  }

  const horizontalPadding = isDesktop ? 40 : isTablet ? 24 : Spacing.lg;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <Text style={styles.title}>Products</Text>
        <Text style={styles.count}>{filtered?.length ?? 0} items</Text>
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
        numColumns={isDesktop ? columns : 1}
        key={isDesktop ? `desktop-${columns}` : "mobile"}
        columnWrapperStyle={isDesktop ? styles.row : undefined}
        renderItem={({ item }) => (
          <ProductCard product={item} />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No products yet</Text>
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
    fontSize: 22,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
  },
  count: { fontSize: 14, color: Colors.textMuted },
  searchContainer: {
    paddingVertical: Spacing.md,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: 12,
    fontSize: FontSize.md,
    backgroundColor: Colors.white,
  },
  list: { paddingVertical: Spacing.md },
  row: {
    justifyContent: "flex-start",
    gap: 12,
  },
  errorText: { color: Colors.error, fontSize: 16 },
  emptyText: { color: Colors.textMuted, textAlign: "center", marginTop: 40, fontSize: 16 },
});
