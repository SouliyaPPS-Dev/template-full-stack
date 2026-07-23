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
} from "react-native";
import { useNavigation } from "@react-navigation/native";
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
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (isSignUp) {
        await onRegister(email, password, fullName, phone || undefined);
      } else {
        await onLogin(email, password);
      }
      navigation.reset({ index: 0, routes: [{ name: "Home" as never }] });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>MyStore</Text>
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
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={Colors.placeholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.button}
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { flexGrow: 1, justifyContent: "center", padding: Spacing.xxl },
  header: { alignItems: "center", marginBottom: 32 },
  logo: {
    fontSize: FontSize.logo,
    fontWeight: Platform.OS === "android" ? "700" : "bold",
    color: Colors.primary,
  },
  subtitle: { fontSize: FontSize.lg, color: Colors.textSecondary, marginTop: Spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    padding: 14,
    fontSize: FontSize.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.cardBg,
  },
  error: { color: Colors.error, fontSize: FontSize.md, marginBottom: Spacing.sm, textAlign: "center" },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    padding: Spacing.lg,
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: Platform.OS === "android" ? "600" : "600",
  },
  link: { color: Colors.primary, textAlign: "center", marginTop: Spacing.lg, fontSize: FontSize.md },
});
