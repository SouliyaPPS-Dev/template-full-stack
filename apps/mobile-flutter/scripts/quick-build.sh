#!/bin/bash
set -e

# Quick Development Build Script
# Usage: ./scripts/quick-build.sh [apk|ios|both]

BUILD_TYPE=${1:-apk}

echo "⚡ Quick Development Build"
echo "========================="

cd "$(dirname "$0")/.."

# Skip dependency check for speed
echo "📦 Using existing dependencies..."

# Generate build number from timestamp
BUILD_NUMBER=$(date +%Y%m%d%H%M)
echo "📅 Build number: $BUILD_NUMBER"

case $BUILD_TYPE in
    apk)
        echo "📱 Quick APK build..."
        flutter build apk --debug --build-number=$BUILD_NUMBER --no-pub
        echo "✅ Quick APK complete: build/app/outputs/flutter-apk/app-debug.apk"
        ;;
    ios)
        echo "🍎 Quick iOS build..."
        flutter build ios --debug --build-number=$BUILD_NUMBER --no-pub --no-codesign
        echo "✅ Quick iOS complete"
        ;;
    both)
        echo "📱 Quick APK build..."
        flutter build apk --debug --build-number=$BUILD_NUMBER --no-pub
        echo "🍎 Quick iOS build..."
        flutter build ios --debug --build-number=$BUILD_NUMBER --no-pub --no-codesign
        echo "✅ Quick builds complete"
        ;;
    *)
        echo "❌ Unknown build type: $BUILD_TYPE"
        echo "Usage: $0 [apk|ios|both]"
        exit 1
        ;;
esac

echo ""
echo "📊 Quick Build Summary:"
echo "  APK: build/app/outputs/flutter-apk/"
echo "  iOS: build/ios/iphoneos/"
echo "  Build Number: $BUILD_NUMBER"
