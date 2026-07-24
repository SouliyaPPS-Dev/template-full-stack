#!/bin/bash
set -e

# Fast iOS Build Script
# Usage: ./scripts/build-ios.sh [--ipa] [--clean] [--profile] [--export-method=app-store|ad-hoc|development]

BUILD_IPA=false
CLEAN=false
PROFILE=false
EXPORT_METHOD="app-store"
TEAM_ID=""
PROVISIONING_PROFILE=""

for arg in "$@"; do
    case $arg in
        --ipa) BUILD_IPA=true ;;
        --clean) CLEAN=true ;;
        --profile) PROFILE=true ;;
        --export-method=*) EXPORT_METHOD="${arg#*=}" ;;
        --team-id=*) TEAM_ID="${arg#*=}" ;;
        --provisioning-profile=*) PROVISIONING_PROFILE="${arg#*=}" ;;
    esac
done

echo "🍎 Fast iOS Build"
echo "================="

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

# Install pods if needed
echo "📦 Installing CocoaPods..."
cd ios
pod install --repo-update
cd ..

# Build for iOS
echo "📱 Building iOS..."
if [ "$PROFILE" = true ]; then
    flutter build ios --profile --build-number=$BUILD_NUMBER --no-codesign
else
    flutter build ios --release --build-number=$BUILD_NUMBER --no-codesign
fi

# Create IPA if requested
if [ "$BUILD_IPA" = true ]; then
    echo "📦 Creating IPA archive..."
    
    # Find the built app
    BUILT_APP="build/ios/iphoneos/Runner.app"
    
    if [ ! -d "$BUILT_APP" ]; then
        echo "❌ Built app not found at $BUILT_APP"
        echo "   Make sure flutter build ios completed successfully"
        exit 1
    fi
    
    # Create IPA directory structure
    IPA_DIR="build/ios/ipa"
    mkdir -p "$IPA_DIR/Payload"
    cp -r "$BUILT_APP" "$IPA_DIR/Payload/"
    
    # Create IPA file
    cd "$IPA_DIR"
    zip -r "../Runner.ipa" Payload/
    cd ../..
    
    echo "✅ IPA created: build/ios/ipa/Runner.ipa"
    
    echo ""
    echo "📋 Manual Xcode Export (if needed):"
    echo "  1. Open: open ios/Runner.xcworkspace"
    echo "  2. Product → Archive"
    echo "  3. Distribute App → App Store Connect"
    echo "  4. Use export method: $EXPORT_METHOD"
fi

echo ""
echo "📊 Build Summary:"
echo "  iOS App: build/ios/iphoneos/"
if [ "$BUILD_IPA" = true ]; then
    echo "  IPA: build/ios/ipa/Runner.ipa"
fi
echo "  Export Method: $EXPORT_METHOD"
echo "  Build Number: $BUILD_NUMBER"
