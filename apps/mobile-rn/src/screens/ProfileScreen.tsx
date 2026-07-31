import React, { useState, useEffect, useCallback, useRef } from "react";
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
  KeyboardAvoidingView,
  Keyboard,
  LayoutChangeEvent,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useProfile, useUpdateProfile } from "../hooks/useQueries";
import { useResponsive } from "../hooks/useResponsive";
import { User } from "../types";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
  CardShadow,
} from "../theme";

interface Props {
  user: User | null;
  onLogout: () => void;
  onUserUpdate: (user: User) => void;
}

interface FieldProps {
  label: string;
  focused?: boolean;
  onLayout?: (e: LayoutChangeEvent) => void;
  children: React.ReactNode;
}

function Field({ label, focused, onLayout, children }: FieldProps) {
  return (
    <View style={styles.field} onLayout={onLayout}>
      <Text style={[styles.fieldLabel, focused && styles.fieldLabelFocused]}>{label}</Text>
      {children}
    </View>
  );
}

export default function ProfileScreen({ user, onLogout, onUserUpdate }: Props) {
  const headerHeight = useHeaderHeight();
  const { data: profile, isLoading, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const { isDesktop, isTablet } = useResponsive();

  const scrollRef = useRef<ScrollView>(null);
  const phoneInputRef = useRef<TextInput>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [focusedField, setFocusedField] = useState<"name" | "phone" | null>(null);
  const [success, setSuccess] = useState("");
  const [cardY, setCardY] = useState(0);
  const [nameFieldY, setNameFieldY] = useState(0);
  const [phoneFieldY, setPhoneFieldY] = useState(0);

  const displayUser = profile || user;

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    if (displayUser) {
      setFullName(displayUser.full_name);
      setPhone(displayUser.phone || "");
    }
  }, [displayUser]);

  const scrollToField = useCallback((y: number) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - Spacing.md), animated: true });
    });
  }, []);

  const focusName = () => {
    setFocusedField("name");
    scrollToField(cardY + nameFieldY);
  };

  const focusPhone = () => {
    setFocusedField("phone");
    scrollToField(cardY + phoneFieldY);
  };

  const handleSave = () => {
    if (!fullName.trim()) {
      Alert.alert("Full name required", "Please enter your full name.");
      return;
    }
    Keyboard.dismiss();
    setFocusedField(null);
    setSuccess("");
    updateProfile.mutate(
      { full_name: fullName.trim(), phone: phone.trim() },
      {
        onSuccess: (updated) => {
          onUserUpdate(updated);
          setSuccess("Profile updated successfully");
          setTimeout(() => setSuccess(""), 3000);
        },
        onError: (err: any) => Alert.alert("Error", err.message),
      }
    );
  };

  const handleLogout = async () => {
    Keyboard.dismiss();
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
  const formWidth = isDesktop ? 680 : "100%";
  const isDirty =
    fullName.trim() !== (displayUser.full_name || "") ||
    phone.trim() !== (displayUser.phone || "");

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? headerHeight : 0}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingHorizontal: horizontalPadding }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.inner, { width: formWidth }]}>
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, isDesktop && styles.avatarDesktop]}>
              <Text style={[styles.avatarText, isDesktop && styles.avatarTextDesktop]}>
                {displayUser.full_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.userName, isDesktop && styles.userNameDesktop]}>{displayUser.full_name}</Text>
            <Text style={styles.userEmail}>{displayUser.email}</Text>
            <View style={styles.roleBadge}>
              <View style={styles.roleDot} />
              <Text style={styles.roleText}>
                {(displayUser.role || "user").charAt(0).toUpperCase() + (displayUser.role || "user").slice(1)}
              </Text>
            </View>
          </View>

          <View style={isDesktop ? styles.row : undefined}>
            <View style={[styles.card, styles.accountCard, isDesktop && styles.cardDesktop]}>
              <Text style={styles.cardTitle}>Account Information</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{displayUser.email}</Text>
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

            <View
              style={[styles.card, isDesktop && styles.cardDesktop]}
              onLayout={(e) => setCardY(e.nativeEvent.layout.y)}
            >
              <Text style={styles.cardTitle}>Edit Profile</Text>

              <Field
                label="Full Name"
                focused={focusedField === "name"}
                onLayout={(e) => setNameFieldY(e.nativeEvent.layout.y)}
              >
                <TextInput
                  style={[styles.input, focusedField === "name" && styles.inputFocused]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor={Colors.placeholder}
                  selectionColor={Colors.primary}
                  autoCorrect={false}
                  autoCapitalize="words"
                  returnKeyType="next"
                  textContentType="name"
                  autoComplete="name"
                  onSubmitEditing={() => phoneInputRef.current?.focus()}
                  onFocus={focusName}
                  onBlur={() => setFocusedField((f) => (f === "name" ? null : f))}
                />
              </Field>

              <Field
                label="Phone"
                focused={focusedField === "phone"}
                onLayout={(e) => setPhoneFieldY(e.nativeEvent.layout.y)}
              >
                <TextInput
                  ref={phoneInputRef}
                  style={[styles.input, focusedField === "phone" && styles.inputFocused]}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter your phone number"
                  placeholderTextColor={Colors.placeholder}
                  selectionColor={Colors.primary}
                  keyboardType="phone-pad"
                  maxLength={20}
                  returnKeyType="done"
                  textContentType="telephoneNumber"
                  autoComplete="tel"
                  onSubmitEditing={Keyboard.dismiss}
                  onFocus={focusPhone}
                  onBlur={() => setFocusedField((f) => (f === "phone" ? null : f))}
                />
              </Field>

              {success ? (
                <View style={styles.successBanner}>
                  <Text style={styles.successIcon}>✓</Text>
                  <Text style={styles.successText}>{success}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  (!isDirty || updateProfile.isPending) && styles.saveButtonDisabled,
                ]}
                onPress={handleSave}
                disabled={!isDirty || updateProfile.isPending}
                activeOpacity={0.85}
              >
                {updateProfile.isPending ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.primaryBg },
  content: { paddingTop: Spacing.md, paddingBottom: 48 },
  inner: { alignSelf: "center", width: "100%" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.primaryBg },
  avatarSection: { alignItems: "center", paddingVertical: Spacing.xl },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
    borderWidth: 3,
    borderColor: Colors.white,
    ...CardShadow,
  },
  avatarDesktop: {
    width: 104,
    height: 104,
    borderRadius: 52,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
    color: Colors.primary,
  },
  avatarTextDesktop: { fontSize: 42 },
  userName: {
    fontSize: FontSize.title,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
    color: Colors.text,
    textAlign: "center",
  },
  userNameDesktop: { fontSize: 28 },
  userEmail: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 999,
    backgroundColor: Colors.primaryLight,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: Spacing.xs,
  },
  roleText: {
    fontSize: FontSize.xs,
    fontWeight: Platform.OS === "android" ? "600" : "600",
    color: Colors.primary,
  },
  row: { flexDirection: "row", gap: Spacing.lg, alignItems: "flex-start" },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    ...CardShadow,
  },
  accountCard: {
    backgroundColor: Colors.cardBg,
  },
  cardDesktop: {
    flex: 1,
    marginBottom: 0,
  },
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.borderLight,
  },
  infoLabel: { fontSize: FontSize.md, color: Colors.textSecondary },
  infoValue: {
    fontSize: FontSize.md,
    fontWeight: Platform.OS === "android" ? "600" : "600",
    color: Colors.text,
    flexShrink: 1,
    marginLeft: Spacing.md,
    textAlign: "right",
  },
  field: { marginBottom: Spacing.md },
  fieldLabel: {
    fontSize: FontSize.sm,
    fontWeight: Platform.OS === "android" ? "600" : "600",
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  fieldLabelFocused: { color: Colors.primary },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    fontSize: FontSize.lg,
    backgroundColor: Colors.white,
    color: Colors.text,
  },
  inputFocused: {
    borderColor: Colors.primary,
    borderWidth: 1.5,
    backgroundColor: Colors.primaryBg,
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    borderColor: "#a7f3d0",
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  successIcon: { color: Colors.success, fontWeight: Platform.OS === "android" ? "700" : "bold", marginRight: Spacing.sm },
  successText: { color: Colors.success, fontSize: FontSize.md, fontWeight: Platform.OS === "android" ? "500" : "500" },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    ...CardShadow,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
  },
  logoutButton: {
    marginTop: Spacing.lg,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  logoutText: {
    color: Colors.error,
    fontSize: FontSize.lg,
    fontWeight: Platform.OS === "android" ? "600" : "600",
  },
});
