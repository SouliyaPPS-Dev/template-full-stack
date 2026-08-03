#!/usr/bin/env bash
set -euo pipefail

# ─── Config ────────────────────────────────────────────────
MOBILE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$MOBILE_DIR/builds"
ANDROID_SDK="$HOME/Library/Android/sdk"
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
APP_NAME="Template"
TEAM_ID="5RWGN8BU5Y"

# Colors
G='\033[0;32m'; Y='\033[1;33m'; R='\033[0;31m'; B='\033[0;34m'; NC='\033[0m'

mkdir -p "$BUILD_DIR"

log()  { echo -e "${G}▸ $1${NC}"; }
warn() { echo -e "${Y}▸ $1${NC}"; }
err()  { echo -e "${R}▸ $1${NC}"; exit 1; }
info() { echo -e "${B}▸ $1${NC}"; }

# ─── Fix PATH (remove XAMPP interference) ─────────────────
fix_path() {
  export PATH=$(echo "$PATH" | tr ':' '\n' | grep -v XAMPP | tr '\n' ':' | sed 's/:$//')
}

# ─── Prebuild (skip if native dirs exist + --clean not requested) ──
prebuild() {
  local platform="$1"
  local force_clean="${2:-}"

  if [ "$force_clean" = "--clean" ]; then
    log "Running expo prebuild ($platform --clean)..."
    cd "$MOBILE_DIR"
    npx expo prebuild --platform "$platform" --clean --no-install 2>&1
  elif [ ! -d "$MOBILE_DIR/$platform" ]; then
    log "No $platform/ directory found, running expo prebuild..."
    cd "$MOBILE_DIR"
    npx expo prebuild --platform "$platform" --no-install 2>&1
  else
    log "$platform/ directory exists, skipping prebuild (use --clean to force)"
  fi
}

# ─── Generate launcher icons from store logo setting ──────
generate_icons() {
  if [ "${NO_SETTINGS_ICON:-}" = "1" ]; then
    warn "Skipping icon generation (NO_SETTINGS_ICON=1)"
    return
  fi
  if [ "${APP_ENV:-}" = "production" ] || [ "${ICON_FROM_SETTINGS:-}" = "1" ]; then
    log "Generating Android icons from store logo setting..."
    python3 "$MOBILE_DIR/scripts/generate_icon.py" 2>&1 || warn "Icon generation failed; using existing icons"
  fi
}

# ─── Android APK ──────────────────────────────────────────
build_apk() {
  export ANDROID_HOME="$ANDROID_SDK"
  export JAVA_HOME

  prebuild android "${1:-}"
  generate_icons

  log "Building APK (assembleRelease)..."
  cd "$MOBILE_DIR/android"
  chmod +x ./gradlew
  ./gradlew assembleRelease --parallel --daemon 2>&1

  local ARTIFACT="$MOBILE_DIR/android/app/build/outputs/apk/release/app-release.apk"
  if [ ! -f "$ARTIFACT" ]; then
    err "APK not found at $ARTIFACT — build may have failed."
  fi

  local OUT="$BUILD_DIR/${APP_NAME}-$(date +%Y%m%d-%H%M).apk"
  cp "$ARTIFACT" "$OUT"
  log "APK ready → $OUT ($(du -h "$OUT" | cut -f1))"
}

# ─── Android AAB ──────────────────────────────────────────
build_aab() {
  export ANDROID_HOME="$ANDROID_SDK"
  export JAVA_HOME

  prebuild android "${1:-}"
  generate_icons

  log "Building App Bundle (bundleRelease)..."
  cd "$MOBILE_DIR/android"
  chmod +x ./gradlew
  ./gradlew bundleRelease --parallel --daemon 2>&1

  local ARTIFACT="$MOBILE_DIR/android/app/build/outputs/bundle/release/app-release.aab"
  if [ ! -f "$ARTIFACT" ]; then
    err "AAB not found at $ARTIFACT — build may have failed."
  fi

  local OUT="$BUILD_DIR/${APP_NAME}-$(date +%Y%m%d-%H%M).aab"
  cp "$ARTIFACT" "$OUT"
  log "App Bundle ready → $OUT ($(du -h "$OUT" | cut -f1))"
}

# ─── iOS .app (simulator, no signing) ─────────────────────
build_ios() {
  fix_path
  prebuild ios "${1:-}"

  local WORKSPACE="$MOBILE_DIR/ios/${APP_NAME}.xcworkspace"

  if [ ! -d "$WORKSPACE" ]; then
    log "Installing CocoaPods..."
    cd "$MOBILE_DIR/ios"
    pod install 2>&1
  fi

  log "Building iOS Release (.app for simulator)..."
  cd "$MOBILE_DIR/ios"
  xcodebuild \
    -workspace "${APP_NAME}.xcworkspace" \
    -scheme "$APP_NAME" \
    -configuration Release \
    -sdk iphonesimulator \
    -derivedDataPath build \
    CODE_SIGNING_ALLOWED=NO \
    -quiet 2>&1

  local ARTIFACT="$MOBILE_DIR/ios/build/Build/Products/Release-iphonesimulator/${APP_NAME}.app"
  if [ ! -d "$ARTIFACT" ]; then
    err ".app not found at $ARTIFACT — build may have failed."
  fi

  local OUT="$BUILD_DIR/${APP_NAME}.app"
  rm -rf "$OUT"
  cp -R "$ARTIFACT" "$OUT"
  log "iOS .app ready → $OUT"
}

# ─── iOS IPA (device, requires Apple signing) ─────────────
build_ipa() {
  fix_path
  prebuild ios "${1:-}"

  local WORKSPACE="$MOBILE_DIR/ios/${APP_NAME}.xcworkspace"

  if [ ! -d "$WORKSPACE" ]; then
    log "Installing CocoaPods..."
    cd "$MOBILE_DIR/ios"
    pod install 2>&1
  fi

  log "Building IPA (archive + export)..."
  log "Using Team ID: $TEAM_ID"
  cd "$MOBILE_DIR/ios"

  # Archive
  xcodebuild \
    -workspace "${APP_NAME}.xcworkspace" \
    -scheme "$APP_NAME" \
    -configuration Release \
    -archivePath "$BUILD_DIR/${APP_NAME}.xcarchive" \
    -destination "generic/platform=iOS" \
    -allowProvisioningUpdates \
    DEVELOPMENT_TEAM="$TEAM_ID" \
    clean archive 2>&1

  # Export IPA
  xcodebuild \
    -exportArchive \
    -archivePath "$BUILD_DIR/${APP_NAME}.xcarchive" \
    -exportOptionsPlist "$MOBILE_DIR/scripts/ExportOptions.plist" \
    -exportPath "$BUILD_DIR" \
    -allowProvisioningUpdates 2>&1

  local IPA=$(find "$BUILD_DIR" -maxdepth 1 -name "*.ipa" 2>/dev/null | head -1)
  if [ -z "$IPA" ]; then
    err "IPA not found. Check Apple signing credentials and team ID."
  fi

  local OUT="$BUILD_DIR/${APP_NAME}-$(date +%Y%m%d-%H%M).ipa"
  mv "$IPA" "$OUT"
  rm -rf "$BUILD_DIR/${APP_NAME}.xcarchive"
  log "IPA ready → $OUT ($(du -h "$OUT" | cut -f1))"
}

# ─── Android Both (APK + AAB) ────────────────────────────
build_android_all() {
  export ANDROID_HOME="$ANDROID_SDK"
  export JAVA_HOME

  prebuild android "${1:-}"
  generate_icons

  log "Building APK + AAB in parallel..."
  cd "$MOBILE_DIR/android"
  chmod +x ./gradlew

  # Build both in parallel
  ./gradlew assembleRelease bundleRelease --parallel --daemon 2>&1

  local APK="$MOBILE_DIR/android/app/build/outputs/apk/release/app-release.apk"
  local AAB="$MOBILE_DIR/android/app/build/outputs/bundle/release/app-release.aab"

  local TIMESTAMP=$(date +%Y%m%d-%H%M)

  if [ -f "$APK" ]; then
    cp "$APK" "$BUILD_DIR/${APP_NAME}-${TIMESTAMP}.apk"
    log "APK ready → $BUILD_DIR/${APP_NAME}-${TIMESTAMP}.apk"
  fi

  if [ -f "$AAB" ]; then
    cp "$AAB" "$BUILD_DIR/${APP_NAME}-${TIMESTAMP}.aab"
    log "AAB ready → $BUILD_DIR/${APP_NAME}-${TIMESTAMP}.aab"
  fi
}

# ─── Web (static export) ──────────────────────────────────
build_web() {
  fix_path
  log "Building web (static export)..."
  cd "$MOBILE_DIR"
  npx expo export --platform web 2>&1

  local OUT="$BUILD_DIR/web"
  rm -rf "$OUT"
  mv dist "$OUT"
  log "Web build ready → $OUT ($(du -h "$OUT" | cut -f1))"
}

# ─── Expo Go (dev testing) ────────────────────────────────
run_expo_go() {
  fix_path
  cd "$MOBILE_DIR"
  log "Starting Expo Go dev server..."
  log "Scan QR code with Expo Go app on your device"
  npx expo start
}

# ─── Main ─────────────────────────────────────────────────
case "${1:-}" in
  apk)
    build_apk "${2:-}"
    ;;
  aab|appbundle)
    build_aab "${2:-}"
    ;;
  ios)
    build_ios "${2:-}"
    ;;
  ipa)
    build_ipa "${2:-}"
    ;;
  web)
    build_web "${2:-}"
    ;;
  android)
    build_android_all "${2:-}"
    ;;
  expo|dev|start)
    run_expo_go
    ;;
  all)
    build_android_all "${2:-}"
    build_ios "${2:-}"
    ;;
  *)
    echo ""
    echo -e "${B}Template Build Script${NC}"
    echo ""
    echo "Usage: ./scripts/build.sh <target> [--clean]"
    echo ""
    echo "  ${G}Android:${NC}"
    echo "    ./scripts/build.sh apk          Android APK (release, signed)"
    echo "    ./scripts/build.sh aab          Android App Bundle (release, signed)"
    echo "    ./scripts/build.sh android      Both APK + AAB"
    echo ""
    echo "  ${G}iOS:${NC}"
    echo "    ./scripts/build.sh ios          iOS .app (simulator, no signing)"
    echo "    ./scripts/build.sh ipa          iOS IPA (device, App Store signing)"
    echo ""
    echo "  ${G}Web:${NC}"
    echo "    ./scripts/build.sh web          Web static export"
    echo ""
    echo "  ${G}Dev:${NC}"
    echo "    ./scripts/build.sh expo         Start Expo Go dev server"
    echo ""
    echo "  ${G}All:${NC}"
    echo "    ./scripts/build.sh all          APK + AAB + iOS .app"
    echo ""
    echo "  ${Y}Options:${NC}"
    echo "    --clean                         Force clean prebuild"
    echo ""
    echo "  ${B}Output:${NC} apps/mobile-rn/builds/"
    echo ""
    echo "  ${B}Expo Go:${NC} ./scripts/build.sh expo"
    echo ""
    ;;
esac
