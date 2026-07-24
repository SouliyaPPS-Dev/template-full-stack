import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

class AppBreakpoints {
  static const double mobile = 600;
  static const double tablet = 1024;
  static const double desktop = 1440;

  static bool isMobile(BuildContext context) =>
      MediaQuery.sizeOf(context).width < mobile;

  static bool isTablet(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    return w >= mobile && w < tablet;
  }

  static bool isDesktop(BuildContext context) =>
      MediaQuery.sizeOf(context).width >= tablet;

  static bool isWeb() => kIsWeb;

  static bool isDesktopPlatform() {
    if (kIsWeb) return false;
    return defaultTargetPlatform == TargetPlatform.macOS ||
        defaultTargetPlatform == TargetPlatform.windows ||
        defaultTargetPlatform == TargetPlatform.linux;
  }

  static bool isMobileDevice() {
    if (kIsWeb) return false;
    return defaultTargetPlatform == TargetPlatform.android ||
        defaultTargetPlatform == TargetPlatform.iOS;
  }

  static int gridColumns(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    if (w >= 1440) return 5;
    if (w >= 1024) return 4;
    if (w >= 600) return 3;
    if (w >= 400) return 2;
    return 1;
  }

  static double maxWidth(BuildContext context) {
    final w = MediaQuery.sizeOf(context).width;
    if (w >= 1440) return 1200;
    if (w >= 1024) return 960;
    if (w >= 600) return 560;
    return w;
  }

  static bool showNavRail(BuildContext context) =>
      MediaQuery.sizeOf(context).width >= 600;

  static bool showDrawer(BuildContext context) =>
      MediaQuery.sizeOf(context).width < 600;
}
