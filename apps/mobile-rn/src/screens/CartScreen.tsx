import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Colors, FontSize, Typography } from "../theme";

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
  title: { fontSize: FontSize.xxl, fontWeight: "bold", marginBottom: 8 },
  subtitle: { ...Typography.bodySecondary, textAlign: "center" },
});
