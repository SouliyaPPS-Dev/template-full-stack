# Flutter-specific ProGuard rules
-keep class io.flutter.** { *; }
-keep class io.flutter.plugins.** { *; }
-dontwarn io.flutter.embedding.**

# Keep annotation
-keepattributes *Annotation*

# Keep R8 from stripping interface information
-keepattributes Signature
-keepattributes Exceptions
