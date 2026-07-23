import React from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from "react-native";

const PRODUCTS = [
  { id: "1", name: "Sample Product", price: 250000 },
  { id: "2", name: "Another Product", price: 500000 },
];

export default function ProductsScreen() {
  return (
    <FlatList
      data={PRODUCTS}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>{item.price.toLocaleString()} LAK</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Add to Cart</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  card: { backgroundColor: "white", padding: 16, borderRadius: 8, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4 },
  name: { fontSize: 18, fontWeight: "600" },
  price: { fontSize: 16, color: "#2563eb", marginTop: 4 },
  button: { backgroundColor: "#2563eb", padding: 8, borderRadius: 6, marginTop: 12, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "600" },
});
