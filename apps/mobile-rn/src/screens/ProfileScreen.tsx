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
} from "react-native";
import { useProfile, useUpdateProfile } from "../hooks/useQueries";
import { User } from "../types";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  Card,
  Typography,
} from "../theme";

interface Props {
  user: User | null;
  onLogout: () => void;
}

export default function ProfileScreen({ user, onLogout }: Props) {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayUser.full_name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{displayUser.full_name}</Text>
        <Text style={styles.userEmail}>{displayUser.email}</Text>
      </View>

      <View style={styles.card}>
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

      <View style={styles.card}>
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

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: 40 },
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
  avatarText: { fontSize: 32, fontWeight: "bold", color: Colors.primary },
  userName: Typography.title,
  userEmail: { fontSize: FontSize.md, color: Colors.textSecondary, marginTop: Spacing.xs },
  card: Card,
  cardTitle: { fontSize: FontSize.lg, fontWeight: "600", marginBottom: Spacing.md },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  infoLabel: Typography.label,
  infoValue: Typography.value,
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: FontSize.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.white,
  },
  success: { ...Typography.success, marginBottom: Spacing.sm },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  saveButtonText: { color: Colors.white, fontSize: FontSize.lg, fontWeight: "600" },
  logoutButton: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    paddingVertical: 14,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: "center",
  },
  logoutText: { color: Colors.error, fontSize: FontSize.lg, fontWeight: "600" },
});
