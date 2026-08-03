import React from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useResponsive } from "../hooks/useResponsive";
import { Colors, FontSize, Spacing, BorderRadius, Fonts } from "../theme";

export default function CartScreen() {
  const { isDesktop } = useResponsive();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, isDesktop && styles.iconWrapDesktop]}>
        <Text style={[styles.icon, isDesktop && styles.iconDesktop]}>&#128722;</Text>
      </View>
      <Text style={[styles.title, isDesktop && styles.titleDesktop]}>Your cart is empty</Text>
      <Text style={styles.subtitle}>Browse products and add items to your cart</Text>
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("Products" as never)}
      >
        <Text style={styles.buttonText}>Browse Products</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
    backgroundColor: Colors.background,
  },
  iconWrap: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + "10",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  iconWrapDesktop: { width: 150, height: 150, borderRadius: 75 },
  icon: { fontSize: 56 },
  iconDesktop: { fontSize: 72 },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
    marginBottom: 8,
    color: Colors.text,
  },
  titleDesktop: { fontSize: 32 },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.xxl,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.md,
  },
  buttonText: { color: Colors.white, fontSize: FontSize.lg, fontFamily: Fonts.semibold },
});
