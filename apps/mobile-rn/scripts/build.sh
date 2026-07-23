#!/usr/bin/env bash
set -euo pipefail

MOBILE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$MOBILE_DIR/builds"
ANDROID_SDK="$HOME/Library/Android/sdk"
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
APP_NAME="MyStore"

G='\033[0;32m'
Y='\033[1;33m'
R='\033[0;31m'
NC='\033[0m'

mkdir -p "$BUILD_DIR"

log()  { echo -e "${G}▸ $1${NC}"; }
warn() { echo -e "${Y}▸ $1${NC}"; }
err()  { echo -e "${R}▸ $1${NC}"; exit 1; }

# ─── Prebuild ─────────────────────────────────────────────
prebuild() {
  local platform="$1"
  log "Running expo prebuild ($platform)..."
  cd "$MOBILE_DIR"
  npx expo prebuild --platform "$platform" --clean --no-install 2>&1

  if [ "$platform" = "android" ]; then
    log "Android prebuild ready"
  fi
}

# ─── Android APK ──────────────────────────────────────────
build_apk() {
  export ANDROID_HOME="$ANDROID_SDK"
  export JAVA_HOME

  prebuild android

  log "Building APK (assembleRelease)..."
  cd "$MOBILE_DIR/android"
  chmod +x ./gradlew
  ./gradlew assembleRelease 2>&1

  local ARTIFACT="$MOBILE_DIR/android/app/build/outputs/apk/release/app-release.apk"
  if [ ! -f "$ARTIFACT" ]; then
    err "APK not found at $ARTIFACT — build may have failed."
  fi

  local OUT="$BUILD_DIR/${APP_NAME}-$(date +%Y%m%d-%H%M).apk"
  cp "$ARTIFACT" "$OUT"
  log "APK ready → $OUT"
}

# ─── Android App Bundle ──────────────────────────────────
build_aab() {
  export ANDROID_HOME="$ANDROID_SDK"
  export JAVA_HOME

  prebuild android

  log "Building App Bundle (bundleRelease)..."
  cd "$MOBILE_DIR/android"
  chmod +x ./gradlew
  ./gradlew bundleRelease 2>&1

  local ARTIFACT="$MOBILE_DIR/android/app/build/outputs/bundle/release/app-release.aab"
  if [ ! -f "$ARTIFACT" ]; then
    err "AAB not found at $ARTIFACT — build may have failed."
  fi

  local OUT="$BUILD_DIR/${APP_NAME}-$(date +%Y%m%d-%H%M).aab"
  cp "$ARTIFACT" "$OUT"
  log "App Bundle ready → $OUT"
}

# ─── iOS (simulator .app) ────────────────────────────────
build_ios() {
  # Remove XAMPP's broken head/tail from PATH
  export PATH=$(echo "$PATH" | tr ':' '\n' | grep -v XAMPP | tr '\n' ':' | sed 's/:$//')

  prebuild ios

  local WORKSPACE="$MOBILE_DIR/ios/${APP_NAME}.xcworkspace"
  local SCHEME="$APP_NAME"

  # Install pods if workspace doesn't exist
  if [ ! -d "$WORKSPACE" ]; then
    log "Installing CocoaPods..."
    cd "$MOBILE_DIR/ios"
    pod install 2>&1
  fi

  log "Building iOS Release (.app for simulator)..."
  cd "$MOBILE_DIR/ios"
  xcodebuild \
    -workspace "${SCHEME}.xcworkspace" \
    -scheme "$SCHEME" \
    -configuration Release \
    -sdk iphonesimulator \
    -derivedDataPath build \
    CODE_SIGNING_ALLOWED=NO \
    -quiet 2>&1

  local ARTIFACT="$MOBILE_DIR/ios/build/Build/Products/Release-iphonesimulator/${SCHEME}.app"
  if [ ! -d "$ARTIFACT" ]; then
    err ".app not found at $ARTIFACT — build may have failed."
  fi

  local OUT="$BUILD_DIR/${SCHEME}.app"
  rm -rf "$OUT"
  cp -R "$ARTIFACT" "$OUT"
  log "iOS .app ready → $OUT"
}

# ─── iOS IPA (device — requires signing) ──────────────────
build_ipa() {
  # Remove XAMPP's broken head/tail from PATH
  export PATH=$(echo "$PATH" | tr ':' '\n' | grep -v XAMPP | tr '\n' ':' | sed 's/:$//')

  prebuild ios

  local WORKSPACE="$MOBILE_DIR/ios/${APP_NAME}.xcworkspace"

  # Install pods if workspace doesn't exist
  if [ ! -d "$WORKSPACE" ]; then
    log "Installing CocoaPods..."
    cd "$MOBILE_DIR/ios"
    pod install 2>&1
  fi

  log "Building IPA (archive + export)..."
  cd "$MOBILE_DIR/ios"

  xcodebuild \
    -workspace "${APP_NAME}.xcworkspace" \
    -scheme "$APP_NAME" \
    -configuration Release \
    -archivePath "$BUILD_DIR/${APP_NAME}.xcarchive" \
    -destination "generic/platform=iOS" \
    -allowProvisioningUpdates \
    clean archive 2>&1

  xcodebuild \
    -exportArchive \
    -archivePath "$BUILD_DIR/${APP_NAME}.xcarchive" \
    -exportOptionsPlist "$MOBILE_DIR/scripts/ExportOptions.plist" \
    -exportPath "$BUILD_DIR" 2>&1

  local IPA=$(find "$BUILD_DIR" -maxdepth 1 -name "*.ipa" 2>/dev/null)
  if [ -z "$IPA" ]; then
    err "IPA not found. Check Apple signing/ExportOptions.plist."
  fi

  local OUT="$BUILD_DIR/${APP_NAME}-$(date +%Y%m%d-%H%M).ipa"
  mv "$IPA" "$OUT"
  rm -rf "$BUILD_DIR/${APP_NAME}.xcarchive"
  log "IPA ready → $OUT"
}

# ─── Main ─────────────────────────────────────────────────
case "${1:-}" in
  apk)
    build_apk
    ;;
  aab|appbundle)
    build_aab
    ;;
  ios)
    build_ios
    ;;
  ipa)
    build_ipa
    ;;
  all)
    build_apk
    build_aab
    build_ios
    ;;
  *)
    echo ""
    echo "Usage: ./scripts/build.sh <target>"
    echo ""
    echo "  ./scripts/build.sh apk       Android APK (release)"
    echo "  ./scripts/build.sh aab       Android App Bundle (release)"
    echo "  ./scripts/build.sh ios       iOS .app (simulator, no signing)"
    echo "  ./scripts/build.sh ipa       iOS IPA (device, requires signing)"
    echo "  ./scripts/build.sh all       Build APK + AAB + iOS .app"
    echo ""
    echo "Output: apps/mobile-rn/builds/"
    echo ""
    ;;
esac
