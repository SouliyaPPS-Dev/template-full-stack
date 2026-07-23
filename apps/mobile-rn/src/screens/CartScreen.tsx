import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Colors, FontSize } from "../theme";

export default function CartScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🛒</Text>
      <Text style={styles.title}>Your cart is empty</Text>
      <Text style={styles.subtitle}>Browse products and add items to your cart</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  icon: { fontSize: 64, marginBottom: 16 },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
    marginBottom: 8,
  },
  subtitle: { fontSize: FontSize.md, color: Colors.textSecondary, textAlign: "center" },
});
