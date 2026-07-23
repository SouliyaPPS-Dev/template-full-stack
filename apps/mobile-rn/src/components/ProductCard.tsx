import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Product } from "../types";

interface Props {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {product.images?.[0] ? (
          <Image source={{ uri: product.images[0] }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.sku}>SKU: {product.sku}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${product.selling_price.toFixed(2)}</Text>
          {product.compare_price > 0 && (
            <Text style={styles.comparePrice}>
              ${product.compare_price.toFixed(2)}
            </Text>
          )}
        </View>
        <Text style={styles.stock}>
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </Text>
        {onAddToCart && (
          <TouchableOpacity
            style={[styles.cartButton, product.stock === 0 && styles.cartButtonDisabled]}
            onPress={() => onAddToCart(product)}
            disabled={product.stock === 0}
          >
            <Text style={styles.cartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
    elevation: 2,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 180,
    backgroundColor: "#f5f5f5",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#999",
    fontSize: 14,
  },
  info: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  sku: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2563eb",
  },
  comparePrice: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "line-through",
  },
  stock: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  cartButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cartButtonDisabled: {
    backgroundColor: "#ccc",
  },
  cartButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
