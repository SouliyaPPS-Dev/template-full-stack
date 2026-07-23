import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/providers.dart';
import '../features/home/screens/home_screen.dart';
import '../features/products/screens/products_screen.dart';
import '../features/cart/screens/cart_screen.dart';
import '../features/auth/screens/login_screen.dart';
import '../features/profile/screens/profile_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);

  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    redirect: (context, state) {
      if (authState.loading) return null;
      final authed = authState.user != null;
      final goingToLogin = state.matchedLocation == '/login';
      if (!authed && !goingToLogin) return '/login';
      if (authed && goingToLogin) return '/';
      return null;
    },
    routes: [
      GoRoute(
        path: "/",
        builder: (context, state) => const HomeScreen(),
      ),
      GoRoute(
        path: "/products",
        builder: (context, state) => const ProductsScreen(),
      ),
      GoRoute(
        path: "/cart",
        builder: (context, state) => const CartScreen(),
      ),
      GoRoute(
        path: "/profile",
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: "/login",
        builder: (context, state) => const LoginScreen(),
      ),
    ],
  );
});

class MyApp extends ConsumerWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: "MyStore",
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorSchemeSeed: Colors.blue,
        useMaterial3: true,
      ),
      routerConfig: router,
    );
  }
}
