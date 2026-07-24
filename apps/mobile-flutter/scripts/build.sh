#!/bin/bash
set -e

# Unified Build Script
# Usage: ./scripts/build.sh [android|ios|both] [--ipa] [--clean] [--profile]

PLATFORM=${1:-both}
BUILD_IPA=false
CLEAN=false
PROFILE=false

for arg in "$@"; do
    case $arg in
        --ipa) BUILD_IPA=true ;;
        --clean) CLEAN=true ;;
        --profile) PROFILE=true ;;
    esac
done

echo "🚀 Unified Flutter Build"
echo "======================="
echo "Platform: $PLATFORM"
echo "Build IPA: $BUILD_IPA"
echo "Clean: $CLEAN"
echo "Profile: $PROFILE"
echo ""

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
echo ""

# Build based on platform
case $PLATFORM in
    android)
        echo "📱 Building Android..."
        if [ "$PROFILE" = true ]; then
            flutter build apk --profile --build-number=$BUILD_NUMBER
        else
            flutter build apk --release --build-number=$BUILD_NUMBER
            flutter build appbundle --release --build-number=$BUILD_NUMBER
        fi
        echo "✅ Android build complete"
        ;;
    ios)
        echo "🍎 Building iOS..."
        cd ios
        pod install --repo-update
        cd ..
        
        if [ "$PROFILE" = true ]; then
            flutter build ios --profile --build-number=$BUILD_NUMBER --no-codesign
        else
            flutter build ios --release --build-number=$BUILD_NUMBER --no-codesign
        fi
        
        if [ "$BUILD_IPA" = true ]; then
            echo "📦 Creating IPA..."
            mkdir -p build/ios/ipa/Payload
            cp -r build/ios/iphoneos/Runner.app build/ios/ipa/Payload/
            cd build/ios/ipa
            zip -r "../Runner.ipa" Payload/
            cd ../../..
            echo "✅ IPA created: build/ios/ipa/Runner.ipa"
        fi
        echo "✅ iOS build complete"
        ;;
    both)
        echo "📱 Building Android..."
        flutter build apk --release --build-number=$BUILD_NUMBER
        flutter build appbundle --release --build-number=$BUILD_NUMBER
        echo "✅ Android builds complete"
        
        echo ""
        echo "🍎 Building iOS..."
        cd ios
        pod install --repo-update
        cd ..
        flutter build ios --release --build-number=$BUILD_NUMBER --no-codesign
        
        if [ "$BUILD_IPA" = true ]; then
            echo "📦 Creating IPA..."
            mkdir -p build/ios/ipa/Payload
            cp -r build/ios/iphoneos/Runner.app build/ios/ipa/Payload/
            cd build/ios/ipa
            zip -r "../Runner.ipa" Payload/
            cd ../../..
            echo "✅ IPA created: build/ios/ipa/Runner.ipa"
        fi
        echo "✅ iOS build complete"
        ;;
    *)
        echo "❌ Unknown platform: $PLATFORM"
        echo "Usage: $0 [android|ios|both] [--ipa] [--clean] [--profile]"
        exit 1
        ;;
esac

echo ""
echo "📊 Build Summary:"
echo "  APK: build/app/outputs/flutter-apk/"
echo "  AAB: build/app/outputs/bundle/release/"
echo "  iOS: build/ios/iphoneos/"
if [ "$BUILD_IPA" = true ]; then
    echo "  IPA: build/ios/ipa/Runner.ipa"
fi
echo "  Build Number: $BUILD_NUMBER"
