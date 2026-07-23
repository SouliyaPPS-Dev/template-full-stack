import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'config.dart';
import 'models.dart';

class ApiService {
  static String? _token;

  static Future<String?> get token async {
    if (_token != null) return _token;
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('user_token');
    return _token;
  }

  static Future<Map<String, String>> _headers() async {
    final t = await token;
    return {
      'Content-Type': 'application/json',
      if (t != null) 'Authorization': 'Bearer $t',
    };
  }

  static Future<T> get<T>(String path, T Function(dynamic) fromJson) async {
    final h = await _headers();
    final res = await http.get(
      Uri.parse('$apiBaseUrl$path'),
      headers: h,
    );
    if (res.statusCode == 401) {
      await logout();
      throw Exception('Unauthorized');
    }
    if (res.statusCode != 200) {
      final err = jsonDecode(res.body);
      throw Exception(err['error'] ?? 'API error: ${res.statusCode}');
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
    );
    if (res.statusCode == 401 && returnOn401) {
      throw Exception('Unauthorized');
    }
    if (res.statusCode != 200 && res.statusCode != 201) {
      final err = jsonDecode(res.body);
      throw Exception(err['error'] ?? 'API error: ${res.statusCode}');
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
    );
    if (res.statusCode == 401) {
      await logout();
      throw Exception('Unauthorized');
    }
    if (res.statusCode != 200) {
      final err = jsonDecode(res.body);
      throw Exception(err['error'] ?? 'API error: ${res.statusCode}');
    }
    return fromJson(jsonDecode(res.body));
  }

  // ── Auth ───────────────────────────────────────────────────

  static Future<AuthResponse> login(String email, String password) async {
    final data = await post<AuthResponse>(
      '/auth/login',
      {'email': email, 'password': password},
      (json) => AuthResponse.fromJson(json),
    );
    _token = data.accessToken;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_token', data.accessToken);
    await prefs.setString('user', jsonEncode(data.user.toJson()));
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
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user_token', data.accessToken);
    await prefs.setString('user', jsonEncode(data.user.toJson()));
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
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('user', jsonEncode(updated.toJson()));
    return updated;
  }

  static Future<void> logout() async {
    _token = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user_token');
    await prefs.remove('user');
  }

  static Future<User?> getStoredUser() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('user');
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

  static Future<List<Product>> getProducts() async {
    return get<List<Product>>(
      '/products',
      (json) => (json as List).map((e) => Product.fromJson(e)).toList(),
    );
  }

  // ── Categories ────────────────────────────────────────────

  static Future<List<Category>> getCategories() async {
    return get<List<Category>>(
      '/categories',
      (json) => (json as List).map((e) => Category.fromJson(e)).toList(),
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
