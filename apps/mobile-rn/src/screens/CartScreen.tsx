import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { useResponsive } from "../hooks/useResponsive";
import { Colors, FontSize, Spacing } from "../theme";

export default function CartScreen() {
  const { isDesktop } = useResponsive();

  return (
    <View style={styles.container}>
      <Text style={[styles.icon, isDesktop && styles.iconDesktop]}>&#128722;</Text>
      <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Your cart is empty</Text>
      <Text style={styles.subtitle}>Browse products and add items to your cart</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  icon: { fontSize: 64, marginBottom: 16 },
  iconDesktop: { fontSize: 80 },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
    marginBottom: 8,
  },
  titleDesktop: { fontSize: 32 },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: "center" },
});
