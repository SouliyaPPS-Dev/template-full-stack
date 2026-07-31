import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { Product } from "../types";
import { useResponsive } from "../hooks/useResponsive";
import { Colors, Spacing, BorderRadius, FontSize } from "../theme";
import { formatMoney } from "../utils/format";

interface Props {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onPress?: () => void;
}

export default function ProductCard({ product, onAddToCart, onPress }: Props) {
  const { isDesktop, isTablet } = useResponsive();

  const cardWidth = isDesktop ? "23%" : isTablet ? "31%" : "100%";
  const hasSale = product.compare_price > 0 && product.compare_price > product.selling_price;
  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock < 10;

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
        {hasSale && (
          <View style={styles.saleBadge}>
            <Text style={styles.saleBadgeText}>Sale</Text>
          </View>
        )}
        {outOfStock && (
          <View style={styles.soldOutOverlay}>
            <Text style={styles.soldOutText}>Out of stock</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={isDesktop ? 2 : 1}>
          {product.name}
        </Text>
        <Text style={styles.sku}>SKU: {product.sku || "—"}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatMoney(product.selling_price)}</Text>
          {hasSale && (
            <Text style={styles.comparePrice}>{formatMoney(product.compare_price)}</Text>
          )}
        </View>
        <View style={styles.stockRow}>
          <View style={[styles.stockDot, { backgroundColor: outOfStock ? Colors.error : lowStock ? Colors.warning : Colors.success }]} />
          <Text style={[styles.stock, { color: outOfStock ? Colors.error : Colors.textSecondary }]}>
            {outOfStock ? "Out of stock" : `${product.stock} in stock`}
          </Text>
        </View>
        {onAddToCart && (
          <TouchableOpacity
            style={[styles.cartButton, outOfStock && styles.cartButtonDisabled]}
            onPress={() => onAddToCart(product)}
            disabled={outOfStock}
          >
            <Text style={styles.cartButtonText}>{outOfStock ? "Unavailable" : "Add to Cart"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  cardDesktop: {
    marginBottom: 16,
  },
  imageContainer: {
    width: "100%",
    height: 180,
    backgroundColor: Colors.primaryBg,
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
  saleBadge: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.violet,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  saleBadgeText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  soldOutOverlay: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: "rgba(15, 23, 42, 0.7)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  soldOutText: {
    color: Colors.white,
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  info: {
    padding: Spacing.md,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: Platform.OS === "android" ? "700" : "600",
    marginBottom: Spacing.xs,
    color: Colors.text,
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
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
  stock: {
    fontSize: FontSize.xs,
  },
  cartButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
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
