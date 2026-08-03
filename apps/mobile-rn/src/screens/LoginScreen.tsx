import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useResponsive } from "../hooks/useResponsive";
import { useSettings } from "../hooks/useQueries";
import {
  Colors,
  Spacing,
  BorderRadius,
  FontSize,
} from "../theme";

interface Props {
  onLogin: (email: string, password: string) => Promise<any>;
  onRegister: (email: string, password: string, fullName: string, phone?: string) => Promise<any>;
}

export default function LoginScreen({ onLogin, onRegister }: Props) {
  const navigation = useNavigation();
  const { isDesktop, isTablet } = useResponsive();
  const settings = useSettings();
  const storeName = settings.data?.find((s) => s.key === "store_name")?.value || "Template";
  const storeLogo = settings.data?.find((s) => s.key === "store_logo")?.value || "";
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await onRegister(email, password, fullName, phone || undefined);
      } else {
        await onLogin(email, password);
      }
      navigation.reset({ index: 0, routes: [{ name: "Main" as never }] });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formWidth = isDesktop ? 420 : isTablet ? 380 : "100%";

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={[styles.scroll, isDesktop && styles.scrollDesktop]} keyboardShouldPersistTaps="handled">
        <View style={[styles.form, { width: formWidth }]}>
          <View style={styles.header}>
            {storeLogo ? (
              <Image
                source={{ uri: storeLogo }}
                style={[styles.logoImage, isDesktop && styles.logoImageDesktop]}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.logoFallback, isDesktop && styles.logoFallbackDesktop]}>
                <MaterialCommunityIcons name="storefront" size={34} color={Colors.primary} />
              </View>
            )}
            <Text style={[styles.logo, isDesktop && styles.logoDesktop]}>{storeName}</Text>
            <Text style={styles.subtitle}>
              {isSignUp ? "Create your account" : "Sign in to your account"}
            </Text>
          </View>

          {isSignUp && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={Colors.placeholder}
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
              <TextInput
                style={styles.input}
                placeholder="Phone (optional)"
                placeholderTextColor={Colors.placeholder}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </>
          )}

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={Colors.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor={Colors.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>
                {isSignUp ? "Create Account" : "Sign In"}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => { setIsSignUp(!isSignUp); setError(""); }}>
            <Text style={styles.link}>
              {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, justifyContent: "center", padding: Spacing.xxl },
  scrollDesktop: {
    alignItems: "center",
    paddingVertical: 60,
  },
  form: { width: "100%" },
  header: { alignItems: "center", marginBottom: 32 },
  logoImage: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.cardBg,
    marginBottom: Spacing.md,
  },
  logoImageDesktop: { width: 88, height: 88 },
  logoFallback: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  logoFallbackDesktop: { width: 88, height: 88 },
  logo: {
    fontSize: FontSize.logo,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
    color: Colors.primary,
  },
  logoDesktop: { fontSize: 48 },
  subtitle: { fontSize: FontSize.lg, color: Colors.textSecondary, marginTop: Spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: 14,
    fontSize: FontSize.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.cardBg,
    color: Colors.text,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    backgroundColor: Colors.cardBg,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  eyeButton: {
    paddingHorizontal: 14,
  },
  error: { color: Colors.error, fontSize: FontSize.md, marginBottom: Spacing.sm, textAlign: "center" },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: Platform.OS === "android" ? "600" : "600",
  },
  link: { color: Colors.primary, textAlign: "center", marginTop: Spacing.lg, fontSize: FontSize.md },
});
