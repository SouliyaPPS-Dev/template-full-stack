# Template React Native - Build Commands
# Usage: make <target>

.PHONY: help apk aab android ios ipa web all expo clean clean-build

SCRIPT := ./scripts/build.sh

help: ## Show this help
	@echo ""
	@echo "Template Build Commands"
	@echo "====================="
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ─── Android ──────────────────────────────────────────────
apk: ## Build Android APK (signed release)
	$(SCRIPT) apk

aab: ## Build Android AAB (signed release, for Play Store)
	$(SCRIPT) aab

android: ## Build both APK + AAB
	$(SCRIPT) android

# ─── iOS ──────────────────────────────────────────────────
ios: ## Build iOS .app (simulator, no signing)
	$(SCRIPT) ios

ipa: ## Build iOS IPA (device, App Store signing via Xcode)
	$(SCRIPT) ipa

# ─── Web ──────────────────────────────────────────────────
web: ## Build web (static export)
	$(SCRIPT) web

# ─── All ──────────────────────────────────────────────────
all: ## Build APK + AAB + iOS .app + Web
	$(SCRIPT) all
	$(SCRIPT) web

# ─── Dev ──────────────────────────────────────────────────
expo: ## Start Expo Go dev server
	$(SCRIPT) expo

dev: expo ## Alias for expo

start: expo ## Alias for expo

# ─── Clean ────────────────────────────────────────────────
clean: ## Clean build cache
	rm -rf builds/ android/app/build ios/build node_modules/.cache .expo dist

clean-build: ## Force clean prebuild and rebuild
	$(SCRIPT) apk --clean

# ─── Generate Keystore ────────────────────────────────────
keystore: ## Generate Android release keystore
	@echo "Generating release keystore..."
	keytool -genkey -v \
		-keystore android/app/upload-keystore.jks \
		-keyalg RSA -keysize 2048 -validity 10000 \
		-alias upload \
		-storepass changeit -keypass changeit \
		-dname "CN=Template, OU=Dev, O=Template, L=Vientiane, ST=Vientiane, C=LA"
	@echo "Keystore created at android/app/upload-keystore.jks"
	@echo "Update android/key.properties with your passwords"
