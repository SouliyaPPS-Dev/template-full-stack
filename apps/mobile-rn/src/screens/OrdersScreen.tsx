import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useOrders } from "../hooks/useQueries";
import { useResponsive } from "../hooks/useResponsive";
import { Order } from "../types";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  Fonts,
} from "../theme";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  processing: "#8b5cf6",
  shipped: "#6366f1",
  delivered: "#10b981",
  cancelled: "#ef4444",
  refunded: "#6b7280",
};

function formatMoney(value: number): string {
  return `₭${Math.round(value).toLocaleString()}`;
}

function OrderCard({ order }: { order: Order }) {
  const { isDesktop } = useResponsive();
  const statusColor = STATUS_COLORS[order.status] || Colors.textMuted;

  return (
    <View style={[styles.orderCard, isDesktop && styles.orderCardDesktop]}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderNumber}>#{order.order_number}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {order.status}
          </Text>
        </View>
      </View>
      <View style={styles.orderRow}>
        <Text style={styles.label}>Total</Text>
        <Text style={styles.value}>{formatMoney(order.grand_total)}</Text>
      </View>
      <View style={styles.orderRow}>
        <Text style={styles.label}>Payment</Text>
        <Text style={styles.value}>{order.payment_status}</Text>
      </View>
      <View style={styles.orderRow}>
        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>
          {order.created_at
            ? new Date(order.created_at).toLocaleDateString()
            : "-"}
        </Text>
      </View>
      {order.items && order.items.length > 0 && (
        <View style={styles.itemsSection}>
          <Text style={styles.itemsTitle}>Items ({order.items.length})</Text>
          {order.items.map((item) => (
            <Text key={item.id} style={styles.itemText}>
              {item.quantity}x {item.product_name} - {formatMoney(item.subtotal)}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

export default function OrdersScreen() {
  const { data: orders, isLoading, error, refetch } = useOrders();
  const { isDesktop } = useResponsive();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load orders</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()} activeOpacity={0.85}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const horizontalPad = isDesktop ? 40 : 16;

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingHorizontal: horizontalPad }]}>
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.count}>{orders?.length ?? 0} orders</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingHorizontal: horizontalPad }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />
        }
        renderItem={({ item }) => <OrderCard order={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyText}>No orders yet</Text>
            <Text style={styles.emptyHint}>Orders you place will appear here.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  title: {
    fontSize: 22,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
  },
  count: { fontSize: 14, color: Colors.textMuted },
  list: { paddingVertical: Spacing.md },
  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  orderCardDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  orderNumber: {
    fontSize: FontSize.lg,
    fontWeight: Platform.OS === "android" ? "700" : "600",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: Platform.OS === "android" ? "600" : "600",
    textTransform: "capitalize",
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  label: { fontSize: FontSize.md, color: Colors.textSecondary },
  value: {
    fontSize: FontSize.md,
    fontWeight: Platform.OS === "android" ? "500" : "500",
  },
  itemsSection: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  itemsTitle: {
    fontSize: FontSize.sm,
    fontWeight: Platform.OS === "android" ? "600" : "600",
    marginBottom: 4,
  },
  itemText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  errorText: { color: Colors.error, fontSize: 16 },
  retryButton: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: { color: Colors.white, fontSize: FontSize.lg, fontFamily: Fonts.semibold },
  empty: { alignItems: "center", marginTop: 60 },
  emptyEmoji: { fontSize: 44, marginBottom: Spacing.md },
  emptyText: { color: Colors.textMuted, textAlign: "center", fontSize: 16 },
  emptyHint: { color: Colors.textSecondary, textAlign: "center", fontSize: FontSize.sm, marginTop: 4 },
});
