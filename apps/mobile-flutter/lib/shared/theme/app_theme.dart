import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class AppTheme {
  static const _seed = Color(0xFF2563EB);

  static ThemeData _base(Brightness brightness) => ThemeData(
        useMaterial3: true,
        colorSchemeSeed: _seed,
        brightness: brightness,
        appBarTheme: const AppBarTheme(centerTitle: false, elevation: 0),
        cardTheme: CardThemeData(elevation: 1, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
        inputDecorationTheme: InputDecorationTheme(
          border: const OutlineInputBorder(),
          filled: true,
          fillColor: brightness == Brightness.dark ? Colors.grey.shade900 : Colors.grey.shade50,
        ),
      );

  static final light = _withFont(_base(Brightness.light));
  static final dark = _withFont(_base(Brightness.dark));

  static ThemeData _withFont(ThemeData theme) {
    final textTheme = GoogleFonts.notoSansLaoTextTheme(theme.textTheme);
    return theme.copyWith(
      textTheme: textTheme,
      appBarTheme: theme.appBarTheme.copyWith(titleTextStyle: textTheme.titleLarge),
    );
  }
}
