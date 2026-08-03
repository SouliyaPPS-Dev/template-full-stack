import 'package:flutter/foundation.dart';

/// Optional API base URL override, e.g. `--dart-define=API_BASE_URL=http://10.0.2.2:8080/api/v1`
const String _apiBaseUrlOverride = String.fromEnvironment('API_BASE_URL');

const String devApiBaseUrl = 'http://localhost:8080/api/v1';
const String prodApiBaseUrl = 'https://souliya-template.hf.space/api/v1';

String get apiBaseUrl {
  if (_apiBaseUrlOverride.isNotEmpty) return _apiBaseUrlOverride;
  if (kReleaseMode) return prodApiBaseUrl;
  if (kIsWeb) {
    try {
      final host = Uri.base.host;
      if (host.isNotEmpty) return 'http://$host:8080/api/v1';
    } catch (_) {}
  }
  return devApiBaseUrl;
}

const String currencySymbol = '₭';
const String appName = 'Template';

bool get isDev => !kReleaseMode;
bool get isProd => kReleaseMode;
