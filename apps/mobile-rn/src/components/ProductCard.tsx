import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Image,
} from "react-native";
import { Product } from "../types";
import { useResponsive } from "../hooks/useResponsive";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
} from "../theme";

interface Props {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onPress?: () => void;
}

export default function ProductCard({ product, onAddToCart, onPress }: Props) {
  const { isDesktop, isTablet } = useResponsive();

  const cardWidth = isDesktop ? "23%" : isTablet ? "31%" : "100%";

  return (
    <TouchableOpacity
      style={[styles.card, { width: cardWidth }, isDesktop && styles.cardDesktop]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.imageContainer, isDesktop && styles.imageContainerDesktop]}>
        {product.images?.[0] ? (
          <Image source={{ uri: product.images[0] }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={isDesktop ? 2 : 1}>
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cardDesktop: {
    marginBottom: 16,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    backgroundColor: "#f5f5f5",
  },
  imageContainerDesktop: {
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
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
    marginBottom: Spacing.xs,
  },
  price: {
    fontSize: FontSize.xl,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
    color: Colors.primary,
    marginRight: Spacing.sm,
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
