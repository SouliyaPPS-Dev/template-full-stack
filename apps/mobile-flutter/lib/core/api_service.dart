import 'dart:convert';

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

import 'config.dart';
import 'models.dart';

class EndpointTestResult {
  final bool ok;
  final String? error;
  final dynamic data;

  const EndpointTestResult({required this.ok, this.error, this.data});
}

typedef SessionExpiredListener = void Function();

class ApiService {
  static String? _token;
  static const _storage = FlutterSecureStorage();

  static final Set<SessionExpiredListener> _sessionExpiredListeners = {};
  static Future<String?>? _refreshPromise;

  static void onSessionExpired(SessionExpiredListener listener) {
    _sessionExpiredListeners.add(listener);
  }

  static void _notifySessionExpired() {
    for (final listener
        in List<SessionExpiredListener>.from(_sessionExpiredListeners)) {
      listener();
    }
  }

  static Future<String?> get token async {
    if (_token != null) return _token;
    _token = await _storage.read(key: 'user_token');
    return _token;
  }

  static Future<void> _saveToken(String value) async {
    _token = value;
    await _storage.write(key: 'user_token', value: value);
  }

  static Future<http.Response> _send(
    String method,
    Uri uri,
    Map<String, String> headers,
    Map<String, dynamic>? body,
  ) {
    switch (method) {
      case 'GET':
        return http.get(uri, headers: headers);
      case 'POST':
        return http.post(uri,
            headers: headers, body: body == null ? null : jsonEncode(body));
      case 'PUT':
        return http.put(uri,
            headers: headers, body: body == null ? null : jsonEncode(body));
      case 'DELETE':
        return http.delete(uri, headers: headers);
      default:
        throw ArgumentError('Unsupported method: $method');
    }
  }

  static Future<String?> _refreshToken() {
    if (_refreshPromise != null) return _refreshPromise!;
    _refreshPromise = _doRefreshToken();
    return _refreshPromise!;
  }

  static Future<String?> _doRefreshToken() async {
    try {
      final t = await token;
      if (t == null) return null;
      final res = await http.post(
        Uri.parse('$apiBaseUrl/auth/refresh'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $t',
        },
      ).timeout(const Duration(seconds: 30));
      if (res.statusCode != 200) return null;
      final data = jsonDecode(res.body);
      if (data is Map<String, dynamic>) {
        final newToken = data['access_token'];
        if (newToken is String && newToken.isNotEmpty) {
          await _saveToken(newToken);
          return newToken;
        }
      }
      return null;
    } catch (_) {
      return null;
    } finally {
      _refreshPromise = null;
    }
  }

  static Map<String, dynamic>? _decodeJwt(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return null;
      final decoded = base64Url.decode(base64Url.normalize(parts[1]));
      final payload = jsonDecode(utf8.decode(decoded));
      if (payload is Map<String, dynamic>) return payload;
      return null;
    } catch (_) {
      return null;
    }
  }

  static Map<String, dynamic> _tryDecodeError(http.Response res) {
    try {
      final err = jsonDecode(res.body);
      if (err is Map<String, dynamic>) return err;
    } catch (_) {}
    return const {};
  }

  static Future<dynamic> _request(
    String method,
    String path, {
    Map<String, dynamic>? body,
    bool isAuthPath = false,
  }) async {
    final t = await token;
    final headers = <String, String>{
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (t != null) 'Authorization': 'Bearer $t',
    };
    final uri = Uri.parse('$apiBaseUrl$path');

    http.Response res;
    try {
      res = await _send(method, uri, headers, body)
          .timeout(const Duration(seconds: 30));
    } catch (e) {
      throw Exception('Network error: $e');
    }

    if (res.statusCode == 401 && !isAuthPath && t != null) {
      final newToken = await _refreshToken();
      if (newToken != null) {
        headers['Authorization'] = 'Bearer $newToken';
        res = await _send(method, uri, headers, body)
            .timeout(const Duration(seconds: 30));
      }
    }

    if (res.statusCode == 401) {
      if (!isAuthPath && t != null) {
        await logout();
        _notifySessionExpired();
        throw Exception('Session expired. Please log in again.');
      }
      final err = _tryDecodeError(res);
      throw Exception(err['error'] ?? 'Unauthorized');
    }

    if (res.statusCode < 200 || res.statusCode >= 300) {
      final err = _tryDecodeError(res);
      throw Exception(err['error'] ?? 'API error: ${res.statusCode}');
    }

    if (res.body.isEmpty) return null;
    return jsonDecode(res.body);
  }

  static Future<T> get<T>(String path, T Function(dynamic) fromJson) async {
    final data = await _request('GET', path);
    return fromJson(data);
  }

  static Future<T> post<T>(
    String path,
    Map<String, dynamic> body,
    T Function(dynamic) fromJson,
  ) async {
    final isAuthPath = path == '/auth/login' || path == '/auth/register';
    final data =
        await _request('POST', path, body: body, isAuthPath: isAuthPath);
    return fromJson(data);
  }

  static Future<T> put<T>(
    String path,
    Map<String, dynamic> body,
    T Function(dynamic) fromJson,
  ) async {
    final data = await _request('PUT', path, body: body);
    return fromJson(data);
  }

  static Future<T> delete<T>(
    String path,
    T Function(dynamic) fromJson,
  ) async {
    final data = await _request('DELETE', path);
    return fromJson(data);
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
    _refreshPromise = null;
    await _storage.delete(key: 'user_token');
    await _storage.delete(key: 'user');
  }

  static Future<User?> getStoredUser() async {
    final raw = await _storage.read(key: 'user');
    if (raw == null) return null;
    try {
      return User.fromJson(jsonDecode(raw));
    } catch (_) {
      return null;
    }
  }

  static Future<bool> isAuthenticated() async {
    final t = await token;
    if (t == null) return false;
    final parts = t.split('.');
    if (parts.length != 3) return false;
    final payload = _decodeJwt(t);
    if (payload == null) return false;
    final expMs = payload['exp'] != null
        ? (payload['exp'] as num).toDouble() * 1000
        : 0.0;
    const refreshBeforeExpiry = Duration(days: 7);
    // Never force logout because of token expiry. If the token is expired or
    // close to expiring, silently refresh it to keep the session alive.
    if (expMs != 0 &&
        DateTime.now().millisecondsSinceEpoch >=
            expMs - refreshBeforeExpiry.inMilliseconds) {
      await _refreshToken();
    }
    return true;
  }

  // ── Health ─────────────────────────────────────────────────

  static Future<Map<String, dynamic>> healthCheck() async {
    final res = await http
        .get(Uri.parse('$apiBaseUrl/health'))
        .timeout(const Duration(seconds: 10));
    if (res.statusCode != 200) {
      throw Exception('Health check failed: ${res.statusCode}');
    }
    return jsonDecode(res.body) as Map<String, dynamic>;
  }

  // ── Products ──────────────────────────────────────────────

  static Future<List<Product>> getProducts({
    String? categoryId,
    String? search,
  }) async {
    final params = <String, String>{};
    if (categoryId != null) params['category_id'] = categoryId;
    if (search != null && search.isNotEmpty) params['search'] = search;
    final qs =
        params.isNotEmpty ? '?${Uri(queryParameters: params).query}' : '';
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

  // ── Endpoint Tests ────────────────────────────────────────

  static Future<Map<String, EndpointTestResult>> testAllEndpoints() async {
    final results = <String, EndpointTestResult>{};

    Future<void> test(String label, Future<void> Function() fn) async {
      try {
        await fn();
        results[label] = const EndpointTestResult(ok: true);
      } catch (e) {
        results[label] = EndpointTestResult(
          ok: false,
          error: e.toString().replaceAll('Exception: ', ''),
        );
      }
    }

    await test('GET /health', () async {
      await healthCheck();
    });
    await test('GET /products', () async {
      await getProducts();
    });
    await test('GET /categories', () async {
      await getCategories();
    });
    await test('GET /settings', () async {
      await getSettings();
    });
    await test('POST /auth/login (wrong pw)', () async {
      try {
        await login('x@x.com', 'wrong');
      } catch (_) {
        // expected — endpoint responded
      }
    });

    final t = await token;
    if (t != null) {
      await test('GET /auth/me', () async {
        await getMe();
      });
      await test('GET /orders', () async {
        await getOrders();
      });
    }

    return results;
  }
}
