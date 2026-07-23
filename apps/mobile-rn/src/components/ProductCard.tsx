import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Product } from "../types";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  CardShadow,
} from "../theme";

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
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...CardShadow,
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
    color: Colors.textMuted,
    fontSize: FontSize.md,
  },
  info: {
    padding: Spacing.md,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: Platform.OS === "android" ? "700" : "600",
    marginBottom: Spacing.xs,
  },
  sku: {
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  price: {
    fontSize: FontSize.xl,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
    color: Colors.primary,
  },
  comparePrice: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    textDecorationLine: "line-through",
  },
  stock: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  cartButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  cartButtonDisabled: {
    backgroundColor: Colors.disabled,
  },
  cartButtonText: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: Platform.OS === "android" ? "700" : "600",
  },
});
