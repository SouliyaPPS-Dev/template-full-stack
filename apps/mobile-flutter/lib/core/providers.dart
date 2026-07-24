import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/models.dart';
import '../core/api_service.dart';

// ── Theme Provider ────────────────────────────────────────────

class ThemeNotifier extends StateNotifier<ThemeMode> {
  ThemeNotifier() : super(ThemeMode.system);

  void setTheme(ThemeMode mode) => state = mode;
  void toggleTheme() {
    state = state == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
  }
}

final themeProvider = StateNotifierProvider<ThemeNotifier, ThemeMode>((ref) {
  return ThemeNotifier();
});

// ── Auth Provider ──────────────────────────────────────────────

class AuthState {
  final User? user;
  final bool loading;

  AuthState({this.user, this.loading = true});

  AuthState copyWith({User? user, bool? loading, bool clearUser = false}) {
    return AuthState(
      user: clearUser ? null : (user ?? this.user),
      loading: loading ?? this.loading,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(AuthState()) {
    _init();
  }

  Future<void> _init() async {
    final authed = await ApiService.isAuthenticated();
    if (authed) {
      final stored = await ApiService.getStoredUser();
      if (stored != null) {
        state = state.copyWith(user: stored, loading: false);
      } else {
        final fresh = await ApiService.getMe();
        state = state.copyWith(user: fresh, loading: false);
      }
    } else {
      state = state.copyWith(loading: false);
    }
  }

  Future<void> login(String email, String password) async {
    final data = await ApiService.login(email, password);
    state = state.copyWith(user: data.user);
  }

  Future<void> register(String email, String password, String fullName,
      {String? phone}) async {
    final data = await ApiService.register(email, password, fullName,
        phone: phone);
    state = state.copyWith(user: data.user);
  }

  Future<void> logout() async {
    await ApiService.logout();
    state = state.copyWith(clearUser: true);
  }

  Future<void> refreshUser() async {
    final fresh = await ApiService.getMe();
    if (fresh != null) {
      state = state.copyWith(user: fresh);
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});

// ── Products Provider ──────────────────────────────────────────

final productsProvider = FutureProvider<List<Product>>((ref) async {
  return ApiService.getProducts();
});

// ── Search Provider ────────────────────────────────────────────

final searchQueryProvider = StateProvider<String>((ref) => '');

final filteredProductsProvider = FutureProvider<List<Product>>((ref) async {
  final query = ref.watch(searchQueryProvider);
  return ApiService.getProducts(search: query.isEmpty ? null : query);
});

// ── Categories Provider ────────────────────────────────────────

final categoriesProvider = FutureProvider<List<Category>>((ref) async {
  return ApiService.getCategories();
});

// ── Selected Category Provider ─────────────────────────────────

final selectedCategoryProvider = StateProvider<String?>((ref) => null);

final categoryProductsProvider = FutureProvider<List<Product>>((ref) async {
  final categoryId = ref.watch(selectedCategoryProvider);
  return ApiService.getProducts(categoryId: categoryId);
});

// ── Orders Provider ────────────────────────────────────────────

final ordersProvider = FutureProvider<List<Order>>((ref) async {
  return ApiService.getOrders();
});

// ── Settings Provider ──────────────────────────────────────────

final settingsProvider = FutureProvider<List<Setting>>((ref) async {
  return ApiService.getSettings();
});
