# Template Flutter - Build Commands
# Usage: make <target>

.PHONY: help apk aab web macos windows linux ios ipa all clean keystore run

APP_NAME = mobile_flutter
BUILD_DIR = build
TEAM_ID = 5RWGN8BU5Y

help: ## Show this help
	@echo ""
	@echo "Template Flutter Build Commands"
	@echo "=============================="
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ─── Android ──────────────────────────────────────────────
apk: ## Build Android APK (release, signed)
	flutter build apk --release
	@echo "Output: $(BUILD_DIR)/app/outputs/flutter-apk/app-release.apk"

aab: ## Build Android AAB (release, signed, for Play Store)
	flutter build appbundle --release
	@echo "Output: $(BUILD_DIR)/app/outputs/bundle/release/app-release.aab"

# ─── Web ──────────────────────────────────────────────────
web: ## Build Web app (release)
	flutter build web --release
	@echo "Output: $(BUILD_DIR)/web/"

web-canvaskit: ## Build Web app (CanvasKit renderer, better quality)
	flutter build web --release --web-renderer canvaskit
	@echo "Output: $(BUILD_DIR)/web/"

# ─── macOS ────────────────────────────────────────────────
macos: ## Build macOS app (release)
	flutter build macos --release
	@echo "Output: $(BUILD_DIR)/macos/Build/Products/Release/"

# ─── Windows ──────────────────────────────────────────────
windows: ## Build Windows app (release)
	flutter build windows --release
	@echo "Output: $(BUILD_DIR)/windows/x64/runner/Release/"

# ─── Linux ────────────────────────────────────────────────
linux: ## Build Linux app (release)
	flutter build linux --release
	@echo "Output: $(BUILD_DIR)/linux/x64/release/bundle/"

# ─── iOS ──────────────────────────────────────────────────
ios: ## Build iOS .app (simulator)
	flutter build ios --release --no-codesign
	@echo "Output: $(BUILD_DIR)/ios/iphoneos/Runner.app"

ipa: ## Build iOS IPA (device, App Store signing)
	@echo "Archiving for device..."
	cd ios && xcodebuild \
		-workspace Runner.xcworkspace \
		-scheme Runner \
		-configuration Release \
		-archivePath "$(CURDIR)/$(BUILD_DIR)/Runner.xcarchive" \
		-destination "generic/platform=iOS" \
		-developmentTeam "$(TEAM_ID)" \
		allowProvisioningUpdates \
		clean archive
	@echo "Exporting IPA..."
	cd ios && xcodebuild \
		-exportArchive \
		-archivePath "$(CURDIR)/$(BUILD_DIR)/Runner.xcarchive" \
		-exportOptionsPlist "$(CURDIR)/scripts/ExportOptions.plist" \
		-exportPath "$(CURDIR)/$(BUILD_DIR)"
	@echo "Output: $(BUILD_DIR)/*.ipa"

# ─── All ──────────────────────────────────────────────────
all-mobile: apk aab ## Build Android APK + AAB
all-desktop: macos windows linux ## Build all desktop platforms
all: apk aab web macos ## Build APK + AAB + Web + macOS

# ─── Dev ──────────────────────────────────────────────────
run: ## Run on connected device (debug)
	flutter run

run-web: ## Run on web browser
	flutter run -d chrome

run-release: ## Run on connected device (release)
	flutter run --release

# ─── Clean ────────────────────────────────────────────────
clean: ## Clean build cache
	flutter clean
	rm -rf $(BUILD_DIR)

# ─── Platforms ────────────────────────────────────────────
platforms: ## Show supported platforms
	@echo ""
	@echo "Supported Platforms:"
	@echo "  Android  : APK, AAB (signed)"
	@echo "  iOS      : .app (simulator), IPA (App Store)"
	@echo "  Web      : HTML/CanvasKit (Chrome, Safari, Edge, Firefox)"
	@echo "  macOS    : .app (native macOS)"
	@echo "  Windows  : .exe (native Windows)"
	@echo "  Linux    : .app (native Linux)"
	@echo ""

# ─── Generate Keystore ────────────────────────────────────
keystore: ## Generate Android release keystore
	@echo "Generating release keystore..."
	keytool -genkey -v \
		-keystore android/app/upload-keystore.jks \
		-keyalg RSA -keysize 2048 -validity 10000 \
		-alias souliyapps \
		-storepass Admin123 -keypass Admin123 \
		-dname "CN=souliyapps, OU=Dev, O=Template, L=Vientiane, ST=Vientiane, C=LA"
	@echo "Keystore created at android/app/upload-keystore.jks"
