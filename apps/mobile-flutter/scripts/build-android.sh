#!/bin/bash
set -e

# Fast Android Build Script
# Usage: ./scripts/build-android.sh [apk|aab|both] [--clean] [--profile]

BUILD_TYPE=${1:-apk}
CLEAN=false
PROFILE=false

for arg in "$@"; do
    case $arg in
        --clean) CLEAN=true ;;
        --profile) PROFILE=true ;;
    esac
done

echo "🚀 Fast Android Build"
echo "===================="

cd "$(dirname "$0")/.."

# Clean build if requested
if [ "$CLEAN" = true ]; then
    echo "🧹 Cleaning build artifacts..."
    flutter clean
    flutter pub get
fi

# Ensure dependencies are up to date
echo "📦 Checking dependencies..."
flutter pub get --no-upgrade

# Generate build number from timestamp
BUILD_NUMBER=$(date +%Y%m%d%H%M)
echo "📅 Build number: $BUILD_NUMBER"

# Build based on type
case $BUILD_TYPE in
    apk)
        echo "📱 Building APK (debug profile: $PROFILE)..."
        if [ "$PROFILE" = true ]; then
            flutter build apk --profile --build-number=$BUILD_NUMBER
        else
            flutter build apk --release --build-number=$BUILD_NUMBER
        fi
        echo "✅ APK built: build/app/outputs/flutter-apk/app-release.apk"
        ;;
    aab)
        echo "📦 Building AAB for Play Store..."
        flutter build appbundle --release --build-number=$BUILD_NUMBER
        echo "✅ AAB built: build/app/outputs/bundle/release/app-release.aab"
        ;;
    both)
        echo "📱 Building APK..."
        flutter build apk --release --build-number=$BUILD_NUMBER
        echo "📦 Building AAB..."
        flutter build appbundle --release --build-number=$BUILD_NUMBER
        echo "✅ Both APK and AAB built!"
        ;;
    *)
        echo "❌ Unknown build type: $BUILD_TYPE"
        echo "Usage: $0 [apk|aab|both] [--clean] [--profile]"
        exit 1
        ;;
esac

echo ""
echo "📊 Build Summary:"
echo "  APK: build/app/outputs/flutter-apk/"
echo "  AAB: build/app/outputs/bundle/release/"
echo "  Build Number: $BUILD_NUMBER"
