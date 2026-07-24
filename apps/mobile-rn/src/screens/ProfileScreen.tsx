import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { useProfile, useUpdateProfile } from "../hooks/useQueries";
import { useResponsive } from "../hooks/useResponsive";
import { User } from "../types";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
} from "../theme";

interface Props {
  user: User | null;
  onLogout: () => void;
}

export default function ProfileScreen({ user, onLogout }: Props) {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const { isDesktop, isTablet } = useResponsive();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [success, setSuccess] = useState("");

  const displayUser = profile || user;

  useEffect(() => {
    if (displayUser) {
      setFullName(displayUser.full_name);
      setPhone(displayUser.phone || "");
    }
  }, [displayUser]);

  const handleSave = () => {
    setSuccess("");
    updateProfile.mutate(
      { full_name: fullName, phone },
      {
        onSuccess: () => {
          setSuccess("Profile updated!");
          setTimeout(() => setSuccess(""), 3000);
        },
        onError: (err: any) => Alert.alert("Error", err.message),
      }
    );
  };

  const handleLogout = async () => {
    await onLogout();
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!displayUser) return null;

  const horizontalPadding = isDesktop ? 40 : isTablet ? 24 : Spacing.lg;
  const formWidth = isDesktop ? 600 : "100%";

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}>
      <View style={[styles.inner, { width: formWidth }]}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatar, isDesktop && styles.avatarDesktop]}>
            <Text style={[styles.avatarText, isDesktop && styles.avatarTextDesktop]}>
              {displayUser.full_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.userName, isDesktop && styles.userNameDesktop]}>{displayUser.full_name}</Text>
          <Text style={styles.userEmail}>{displayUser.email}</Text>
        </View>

        <View style={isDesktop ? styles.row : undefined}>
          <View style={[styles.card, isDesktop && styles.cardDesktop]}>
            <Text style={styles.cardTitle}>Account Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{displayUser.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>{displayUser.role}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>
                {displayUser.created_at
                  ? new Date(displayUser.created_at).toLocaleDateString()
                  : "-"}
              </Text>
            </View>
          </View>

          <View style={[styles.card, isDesktop && styles.cardDesktop]}>
            <Text style={styles.cardTitle}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Full Name"
              placeholderTextColor={Colors.placeholder}
            />
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Phone"
              placeholderTextColor={Colors.placeholder}
              keyboardType="phone-pad"
            />

            {success ? <Text style={styles.success}>{success}</Text> : null}

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
  inner: { alignSelf: "center", width: "100%" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  avatarSection: { alignItems: "center", paddingVertical: 24 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  avatarDesktop: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
    color: Colors.primary,
  },
  avatarTextDesktop: { fontSize: 40 },
  userName: {
    fontSize: 22,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
  },
  userNameDesktop: { fontSize: 28 },
  userEmail: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  row: { flexDirection: "row", gap: 16 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardDesktop: {
    flex: 1,
    marginBottom: 0,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: Platform.OS === "android" ? "600" : "600",
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  infoValue: {
    fontSize: FontSize.md,
    fontWeight: Platform.OS === "android" ? "500" : "500",
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: FontSize.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.white,
  },
  success: { color: Colors.success, fontSize: FontSize.md, textAlign: "center", marginBottom: Spacing.sm },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: Platform.OS === "android" ? "600" : "600",
  },
  logoutButton: {
    marginTop: Spacing.lg,
    paddingVertical: 14,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: "center",
  },
  logoutText: {
    color: Colors.error,
    fontSize: FontSize.lg,
    fontWeight: Platform.OS === "android" ? "600" : "600",
  },
});
