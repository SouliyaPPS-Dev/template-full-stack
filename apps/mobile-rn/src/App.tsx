import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  View,
  StyleSheet,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getStoredUser,
  isAuthenticated as checkAuth,
  getMe,
  onSessionExpired,
} from "./services/api";
import { User } from "./types";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import ProductsScreen from "./screens/ProductsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import CartScreen from "./screens/CartScreen";
import OrdersScreen from "./screens/OrdersScreen";
import { Colors } from "./theme";

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

if (typeof console !== "undefined") {
  const origWarn = console.warn;
  console.warn = (...args: any[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (msg.includes("pointerEvents")) return;
    origWarn(...args);
  };
  const origError = console.error;
  console.error = (...args: any[]) => {
    const msg = typeof args[0] === "string" ? args[0] : "";
    if (msg.includes("aria-hidden")) return;
    origError(...args);
  };
}

type RootParamList = {
  Login: undefined;
  Home: undefined;
  Products: undefined;
  Profile: undefined;
  Cart: undefined;
  Orders: undefined;
};

function RootNavigator() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navRef = useNavigationContainerRef<RootParamList>();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const authed = await checkAuth();
        if (cancelled) return;
        if (authed) {
          try {
            const fresh = await getMe();
            if (cancelled) return;
            setUser(fresh);
          } catch (err: any) {
            if (cancelled) return;
            const isAuthError =
              err?.message?.includes("Session expired") ||
              err?.message?.includes("Unauthorized");
            if (!isAuthError) {
              const stored = await getStoredUser();
              if (!cancelled) setUser(stored);
            }
          }
        }
      } catch {
        if (!cancelled) setUser(null);
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return onSessionExpired(() => {
      setUser(null);
      queryClient.resetQueries();
      try {
        if (navRef.isReady()) {
          navRef.resetRoot({ index: 0, routes: [{ name: "Login" }] });
        }
      } catch {}
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(
    async (email: string, password: string, fullName: string, phone?: string) => {
      const data = await apiRegister(email, password, fullName, phone);
      setUser(data.user);
      return data;
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {}
    setUser(null);
    queryClient.resetQueries();
    try {
      if (navRef.isReady()) {
        navRef.resetRoot({ index: 0, routes: [{ name: "Login" }] });
      }
    } catch {}
  }, []);

  const handleUserUpdate = useCallback((updated: User) => {
    setUser(updated);
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navRef}>
      <Stack.Navigator
        initialRouteName={user ? "Home" : "Login"}
        screenOptions={{
          headerStyle: { backgroundColor: Colors.primary },
          headerTintColor: Colors.white,
        }}
      >
        <Stack.Screen name="Login" options={{ headerShown: false }}>
          {() => (
            <LoginScreen
              onLogin={login}
              onRegister={register}
            />
          )}
        </Stack.Screen>
        <Stack.Screen name="Home" options={{ title: "Template" }}>
          {() => (
            <HomeScreen user={user} onLogout={logout} />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="Products"
          component={ProductsScreen}
          options={{ title: "Products" }}
        />
        <Stack.Screen name="Profile" options={{ title: "My Profile" }}>
          {() => (
            <ProfileScreen user={user} onLogout={logout} onUserUpdate={handleUserUpdate} />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ title: "Cart" }}
        />
        <Stack.Screen
          name="Orders"
          component={OrdersScreen}
          options={{ title: "My Orders" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
});
