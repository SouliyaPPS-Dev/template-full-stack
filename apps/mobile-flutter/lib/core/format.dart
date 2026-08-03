import 'config.dart';

/// Format an amount as LAK (Kip), e.g. 12500 -> "₭12,500".
String formatMoney(num amount) {
  final s = amount.round().toString();
  final buffer = StringBuffer();
  for (var i = 0; i < s.length; i++) {
    buffer.write(s[i]);
    final remaining = s.length - i - 1;
    if (remaining > 0 && remaining % 3 == 0) buffer.write(',');
  }
  return '$currencySymbol$buffer';
}

/// Compute initials from a full name, e.g. "John Doe" -> "JD".
String initials(String name) {
  final parts =
      name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
  if (parts.isEmpty) return '?';
  if (parts.length == 1) return parts.first[0].toUpperCase();
  return (parts.first[0] + parts.last[0]).toUpperCase();
}
