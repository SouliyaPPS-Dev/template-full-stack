import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useProducts } from "../hooks/useQueries";
import ProductCard from "../components/ProductCard";
import { Product } from "../types";
import {
  Colors,
  Spacing,
  Typography,
} from "../theme";

export default function ProductsScreen() {
  const { data: products, isLoading, error } = useProducts();

  const handleAddToCart = (product: Product) => {
    Alert.alert("Added", `${product.name} added to cart`);
  };

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        <Text style={styles.count}>{products?.length ?? 0} items</Text>
      </View>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ProductCard product={item} onAddToCart={handleAddToCart} />
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
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: Typography.title,
  count: Typography.small,
  list: { padding: Spacing.lg },
  errorText: { color: Colors.error, fontSize: 16 },
  emptyText: { ...Typography.emptyText, marginTop: 40 },
});
