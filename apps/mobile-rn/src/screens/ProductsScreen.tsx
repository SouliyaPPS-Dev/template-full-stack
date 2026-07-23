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

export default function ProductsScreen() {
  const { data: products, isLoading, error } = useProducts();

  const handleAddToCart = (product: Product) => {
    Alert.alert("Added", `${product.name} added to cart`);
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563eb" />
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
  container: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  title: { fontSize: 22, fontWeight: "bold" },
  count: { fontSize: 14, color: "#999" },
  list: { padding: 16 },
  errorText: { color: "#dc2626", fontSize: 16 },
  emptyText: { color: "#999", textAlign: "center", marginTop: 40, fontSize: 16 },
});
