import React, { useEffect, useState, useCallback } from "react";
import {
  ActivityIndicator,
  View,
  Text,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  NavigationContainer,
  useNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import {
  NotoSansLao_400Regular,
  NotoSansLao_500Medium,
  NotoSansLao_600SemiBold,
  NotoSansLao_700Bold,
} from "@expo-google-fonts/noto-sans-lao";
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
import ErrorBoundary from "./components/ErrorBoundary";
import LoginScreen from "./screens/LoginScreen";
import HomeScreen from "./screens/HomeScreen";
import ProductsScreen from "./screens/ProductsScreen";
import ProfileScreen from "./screens/ProfileScreen";
import CartScreen from "./screens/CartScreen";
import OrdersScreen from "./screens/OrdersScreen";
import { useSettings } from "./hooks/useQueries";
import { Colors, Fonts } from "./theme";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      gcTime: 10 * 60 * 1000,
      refetchOnReconnect: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

type RootParamList = {
  Login: undefined;
  Main: undefined;
};

type TabParamList = {
  Home: undefined;
  Products: undefined;
  Cart: undefined;
  Orders: undefined;
  Account: undefined;
};

function tabIcon(name: keyof typeof Feather.glyphMap) {
  return ({ color, size }: { color: string; size: number }) => (
    <Feather name={name} size={size} color={color} />
  );
}

function StoreHeader({ logoUrl, storeName }: { logoUrl?: string; storeName?: string }) {
  return (
    <View style={styles.brandRow}>
      {logoUrl ? (
        <Image source={{ uri: logoUrl }} style={styles.brandLogo} resizeMode="contain" />
      ) : (
        <View style={styles.brandLogoFallback}>
          <MaterialCommunityIcons name="storefront" size={20} color={Colors.white} />
        </View>
      )}
      <Text style={styles.brandTitle} numberOfLines={1}>
        {storeName || "Template"}
      </Text>
    </View>
  );
}

function MainTabs({
  user,
  onLogout,
  onUserUpdate,
}: {
  user: User | null;
  onLogout: () => void;
  onUserUpdate: (user: User) => void;
}) {
  const settings = useSettings();
  const storeName =
    settings.data?.find((s) => s.key === "store_name")?.value || "Template";
  const storeLogo = settings.data?.find((s) => s.key === "store_logo")?.value || "";

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.primary },
        headerTintColor: Colors.white,
        headerTitleStyle: { fontFamily: Fonts.bold },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.borderLight,
          borderTopWidth: 1,
          height: 60,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontFamily: Fonts.semibold },
      }}
    >
      <Tab.Screen
        name="Home"
        options={{
          title: storeName,
          tabBarLabel: "Home",
          tabBarIcon: tabIcon("home"),
          headerTitleAlign: "left",
          headerTitle: () => <StoreHeader logoUrl={storeLogo} storeName={storeName} />,
        }}
      >
        {() => (
          <ErrorBoundary>
            <HomeScreen user={user} />
          </ErrorBoundary>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Products"
        options={{
          title: "Products",
          tabBarIcon: tabIcon("shopping-bag"),
        }}
      >
        {() => (
          <ErrorBoundary>
            <ProductsScreen />
          </ErrorBoundary>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Cart"
        options={{
          title: "Cart",
          tabBarIcon: tabIcon("shopping-cart"),
        }}
      >
        {() => (
          <ErrorBoundary>
            <CartScreen />
          </ErrorBoundary>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Orders"
        options={{
          title: "My Orders",
          tabBarLabel: "Orders",
          tabBarIcon: tabIcon("package"),
        }}
      >
        {() => (
          <ErrorBoundary>
            <OrdersScreen />
          </ErrorBoundary>
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Account"
        options={{
          title: "My Profile",
          tabBarLabel: "Account",
          tabBarIcon: tabIcon("user"),
        }}
      >
        {() => (
          <ErrorBoundary>
            <ProfileScreen user={user} onLogout={onLogout} onUserUpdate={onUserUpdate} />
          </ErrorBoundary>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

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
      <ErrorBoundary>
        <Stack.Navigator
          initialRouteName={user ? "Main" : "Login"}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login">
            {() => (
              <LoginScreen
                onLogin={login}
                onRegister={register}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Main">
            {() => (
              <MainTabs user={user} onLogout={logout} onUserUpdate={handleUserUpdate} />
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </ErrorBoundary>
    </NavigationContainer>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    NotoSansLao_400Regular,
    NotoSansLao_500Medium,
    NotoSansLao_600SemiBold,
    NotoSansLao_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

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
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  brandLogo: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.white,
  },
  brandLogoFallback: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    color: Colors.white,
    fontFamily: Fonts.bold,
    fontSize: 18,
    flexShrink: 1,
  },
});
