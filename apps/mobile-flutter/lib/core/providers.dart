import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/models.dart';
import '../core/api_service.dart';

// ── Theme Provider ────────────────────────────────────────────

class ThemeNotifier extends Notifier<ThemeMode> {
  @override
  ThemeMode build() => ThemeMode.system;

  void setTheme(ThemeMode mode) => state = mode;
  void toggleTheme() {
    state = state == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
  }
}

final themeProvider = NotifierProvider<ThemeNotifier, ThemeMode>(
  ThemeNotifier.new,
);

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

class AuthNotifier extends Notifier<AuthState> {
  static bool _sessionListenerRegistered = false;

  @override
  AuthState build() {
    if (!_sessionListenerRegistered) {
      _sessionListenerRegistered = true;
      ApiService.onSessionExpired(_handleSessionExpired);
    }
    _init();
    return AuthState();
  }

  void _handleSessionExpired() {
    state = state.copyWith(clearUser: true, loading: false);
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
    final data =
        await ApiService.register(email, password, fullName, phone: phone);
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

final authProvider = NotifierProvider<AuthNotifier, AuthState>(
  AuthNotifier.new,
);

// ── Health Check Provider ─────────────────────────────────────

final healthCheckProvider = FutureProvider<Map<String, dynamic>>((ref) async {
  return ApiService.healthCheck();
});

// ── Endpoint Tests Provider ───────────────────────────────────

final testEndpointsProvider =
    FutureProvider<Map<String, EndpointTestResult>>((ref) async {
  return ApiService.testAllEndpoints();
});

// ── Products Provider ──────────────────────────────────────────

final productsProvider = FutureProvider<List<Product>>((ref) async {
  return ApiService.getProducts();
});

// ── Search Provider ────────────────────────────────────────────

class SearchQueryNotifier extends Notifier<String> {
  @override
  String build() => '';

  void set(String value) => state = value;
  void clear() => state = '';
}

final searchQueryProvider = NotifierProvider<SearchQueryNotifier, String>(
  SearchQueryNotifier.new,
);

// ── Categories Provider ────────────────────────────────────────

final categoriesProvider = FutureProvider<List<Category>>((ref) async {
  return ApiService.getCategories();
});

// ── Selected Category Provider ─────────────────────────────────

class SelectedCategoryNotifier extends Notifier<String?> {
  @override
  String? build() => null;

  void set(String? value) => state = value;
  void clear() => state = null;
}

final selectedCategoryProvider =
    NotifierProvider<SelectedCategoryNotifier, String?>(
  SelectedCategoryNotifier.new,
);

// ── Filtered Products Provider ────────────────────────────────
// Fetches all products once and filters client-side by search
// (name / sku) and selected category — mirrors the RN app behaviour.

final filteredProductsProvider = FutureProvider<List<Product>>((ref) async {
  final query = ref.watch(searchQueryProvider).trim().toLowerCase();
  final categoryId = ref.watch(selectedCategoryProvider);
  final products = await ref.watch(productsProvider.future);
  return products.where((p) {
    if (categoryId != null && p.categoryId != categoryId) return false;
    if (query.isNotEmpty &&
        !p.name.toLowerCase().contains(query) &&
        !p.sku.toLowerCase().contains(query)) {
      return false;
    }
    return true;
  }).toList();
});

// ── Orders Provider ────────────────────────────────────────────

final ordersProvider = FutureProvider<List<Order>>((ref) async {
  return ApiService.getOrders();
});

// ── Settings Provider ──────────────────────────────────────────

final settingsProvider = FutureProvider<List<Setting>>((ref) async {
  return ApiService.getSettings();
});
