# Flutter Fast Build System

## Quick Start

```bash
# Show all available commands
make help

# Build APK for Android
make build-apk

# Build AAB for Play Store
make build-aab

# Build IPA for App Store
make build-ipa

# Quick debug builds (faster, skip dependency check)
make quick-apk
make quick-ios
make quick-all
```

## Android Builds

### APK (Direct Install)
```bash
make build-apk
# Output: build/app/outputs/flutter-apk/app-release.apk
```

### AAB (Play Store)
```bash
make build-aab
# Output: build/app/outputs/bundle/release/app-release.aab
```

### Both APK and AAB
```bash
make build-android
```

## iOS Builds

### iOS App
```bash
make build-ios
# Output: build/ios/iphoneos/Runner.app
```

### IPA (App Store)
```bash
make build-ipa
# Output: build/ios/ipa/Runner.ipa
```

## Development

```bash
# Run on connected device
make run

# Run in debug mode
make run-debug

# Run tests
make test

# Code quality
make lint
make format
make analyze
```

## Fast Builds

Skip dependency check for faster builds:

```bash
# Quick debug APK
make quick-apk

# Quick debug iOS
make quick-ios

# Quick all platforms
make quick-all

# Profile builds for performance testing
make profile-apk
make profile-ios
```

## Setup Signing

### Android
1. Generate keystore:
```bash
keytool -genkey -v -keystore android/app/upload-keystore.jks \
  -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

2. Update `android/key.properties` with your keystore password.

### iOS
1. Install Fastlane:
```bash
gem install fastlane
```

2. Setup signing:
```bash
make setup-signing
```

3. Configure environment variables:
```bash
export MATCH_GIT_URL='git@github.com:your-org/your-certificates.git'
export MATCH_PASSWORD='your-match-password'
```

## Fastlane Commands

### iOS
```bash
cd ios

# Build for App Store
fastlane app_store

# Upload to TestFlight
fastlane testflight

# Upload to App Store
fastlane release
```

### Android
```bash
cd android

# Build APK
fastlane internal

# Build AAB
fastlane play_store

# Upload to Play Store (internal track)
fastlane upload_internal
```

## Build Optimization

The following optimizations are enabled in `android/gradle.properties`:

- **Parallel builds**: `org.gradle.parallel=true`
- **Build caching**: `org.gradle.caching=true`
- **Configure on demand**: `org.gradle.configureondemand=true`
- **Daemon mode**: `org.gradle.daemon=true`
- **Worker threads**: `org.gradle.workers.max=8`
- **File watching**: `org.gradle.vfs.watch=true`
- **Kotlin incremental**: `kotlin.incremental=true`

## Build Output Locations

```
build/
├── app/
│   └── outputs/
│       ├── flutter-apk/
│       │   └── app-release.apk
│       └── bundle/
│           └── release/
│               └── app-release.aab
└── ios/
    ├── iphoneos/
    │   └── Runner.app
    └── ipa/
        └── Runner.ipa
```
