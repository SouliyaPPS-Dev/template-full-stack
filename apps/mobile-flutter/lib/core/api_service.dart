import 'dart:convert';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'config.dart';
import 'models.dart';

class ApiService {
  static String? _token;
  static const _storage = FlutterSecureStorage();

  static Future<String?> get token async {
    if (_token != null) return _token;
    _token = await _storage.read(key: 'user_token');
    return _token;
  }

  static Future<Map<String, String>> _headers() async {
    final t = await token;
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (t != null) 'Authorization': 'Bearer $t',
    };
  }

  static Future<T> get<T>(String path, T Function(dynamic) fromJson) async {
    final h = await _headers();
    final res = await http.get(
      Uri.parse('$apiBaseUrl$path'),
      headers: h,
    ).timeout(const Duration(seconds: 30));
    if (res.statusCode == 401) {
      await logout();
      throw Exception('Unauthorized');
    }
    if (res.statusCode != 200) {
      try {
        final err = jsonDecode(res.body);
        throw Exception(err['error'] ?? 'API error: ${res.statusCode}');
      } catch (_) {
        throw Exception('API error: ${res.statusCode}');
      }
    }
    return fromJson(jsonDecode(res.body));
  }

  static Future<T> post<T>(
    String path,
    Map<String, dynamic> body,
    T Function(dynamic) fromJson, {
    bool returnOn401 = false,
  }) async {
    final h = await _headers();
    final res = await http.post(
      Uri.parse('$apiBaseUrl$path'),
      headers: h,
      body: jsonEncode(body),
    ).timeout(const Duration(seconds: 30));
    if (res.statusCode == 401 && returnOn401) {
      throw Exception('Unauthorized');
    }
    if (res.statusCode != 200 && res.statusCode != 201) {
      try {
        final err = jsonDecode(res.body);
        throw Exception(err['error'] ?? 'API error: ${res.statusCode}');
      } catch (_) {
        throw Exception('API error: ${res.statusCode}');
      }
    }
    return fromJson(jsonDecode(res.body));
  }

  static Future<T> put<T>(
    String path,
    Map<String, dynamic> body,
    T Function(dynamic) fromJson,
  ) async {
    final h = await _headers();
    final res = await http.put(
      Uri.parse('$apiBaseUrl$path'),
      headers: h,
      body: jsonEncode(body),
    ).timeout(const Duration(seconds: 30));
    if (res.statusCode == 401) {
      await logout();
      throw Exception('Unauthorized');
    }
    if (res.statusCode != 200) {
      try {
        final err = jsonDecode(res.body);
        throw Exception(err['error'] ?? 'API error: ${res.statusCode}');
      } catch (_) {
        throw Exception('API error: ${res.statusCode}');
      }
    }
    return fromJson(jsonDecode(res.body));
  }

  static Future<T> delete<T>(
    String path,
    T Function(dynamic) fromJson,
  ) async {
    final h = await _headers();
    final res = await http.delete(
      Uri.parse('$apiBaseUrl$path'),
      headers: h,
    ).timeout(const Duration(seconds: 30));
    if (res.statusCode == 401) {
      await logout();
      throw Exception('Unauthorized');
    }
    if (res.statusCode != 200 && res.statusCode != 204) {
      try {
        final err = jsonDecode(res.body);
        throw Exception(err['error'] ?? 'API error: ${res.statusCode}');
      } catch (_) {
        throw Exception('API error: ${res.statusCode}');
      }
    }
    return fromJson(res.body.isEmpty ? null : jsonDecode(res.body));
  }

  // ── Auth ───────────────────────────────────────────────────

  static Future<AuthResponse> login(String email, String password) async {
    final data = await post<AuthResponse>(
      '/auth/login',
      {'email': email, 'password': password},
      (json) => AuthResponse.fromJson(json),
    );
    _token = data.accessToken;
    await _storage.write(key: 'user_token', value: data.accessToken);
    await _storage.write(key: 'user', value: jsonEncode(data.user.toJson()));
    return data;
  }

  static Future<AuthResponse> register(
    String email,
    String password,
    String fullName, {
    String? phone,
  }) async {
    final body = {
      'email': email,
      'password': password,
      'full_name': fullName,
      if (phone != null) 'phone': phone,
    };
    final data = await post<AuthResponse>(
      '/auth/register',
      body,
      (json) => AuthResponse.fromJson(json),
    );
    _token = data.accessToken;
    await _storage.write(key: 'user_token', value: data.accessToken);
    await _storage.write(key: 'user', value: jsonEncode(data.user.toJson()));
    return data;
  }

  static Future<User?> getMe() async {
    try {
      return await get<User>('/auth/me', (json) => User.fromJson(json));
    } catch (_) {
      return null;
    }
  }

  static Future<User> updateProfile({
    String? fullName,
    String? phone,
  }) async {
    final body = <String, dynamic>{};
    if (fullName != null) body['full_name'] = fullName;
    if (phone != null) body['phone'] = phone;
    final updated = await put<User>(
      '/auth/me',
      body,
      (json) => User.fromJson(json),
    );
    await _storage.write(key: 'user', value: jsonEncode(updated.toJson()));
    return updated;
  }

  static Future<void> logout() async {
    _token = null;
    await _storage.delete(key: 'user_token');
    await _storage.delete(key: 'user');
  }

  static Future<User?> getStoredUser() async {
    final raw = await _storage.read(key: 'user');
    if (raw == null) return null;
    return User.fromJson(jsonDecode(raw));
  }

  static Future<bool> isAuthenticated() async {
    final t = await token;
    if (t == null) return false;
    try {
      final parts = t.split('.');
      if (parts.length != 3) return false;
      final payload = jsonDecode(
        utf8.decode(base64Url.decode(parts[1])),
      );
      final exp = payload['exp'];
      if (exp != null &&
          DateTime.now().millisecondsSinceEpoch >= exp * 1000) {
        await logout();
        return false;
      }
      return true;
    } catch (_) {
      await logout();
      return false;
    }
  }

  // ── Products ──────────────────────────────────────────────

  static Future<List<Product>> getProducts({
    String? categoryId,
    String? search,
  }) async {
    final params = <String, String>{};
    if (categoryId != null) params['category_id'] = categoryId;
    if (search != null && search.isNotEmpty) params['search'] = search;
    final qs = params.isNotEmpty ? '?${Uri(queryParameters: params).query}' : '';
    return get<List<Product>>(
      '/products$qs',
      (json) => (json as List).map((e) => Product.fromJson(e)).toList(),
    );
  }

  static Future<Product> getProduct(String id) async {
    return get<Product>(
      '/products/$id',
      (json) => Product.fromJson(json),
    );
  }

  // ── Categories ────────────────────────────────────────────

  static Future<List<Category>> getCategories() async {
    return get<List<Category>>(
      '/categories',
      (json) => (json as List).map((e) => Category.fromJson(e)).toList(),
    );
  }

  // ── Orders ────────────────────────────────────────────────

  static Future<List<Order>> getOrders() async {
    return get<List<Order>>(
      '/orders',
      (json) => (json as List).map((e) => Order.fromJson(e)).toList(),
    );
  }

  // ── Settings ──────────────────────────────────────────────

  static Future<List<Setting>> getSettings() async {
    return get<List<Setting>>(
      '/settings',
      (json) => (json as List).map((e) => Setting.fromJson(e)).toList(),
    );
  }
}
