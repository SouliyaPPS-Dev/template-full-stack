#!/bin/bash
set -e

# Android Signing Setup Script
# Usage: ./scripts/setup-android-signing.sh

echo "🔐 Android Signing Setup"
echo "========================"

cd "$(dirname "$0")/.."

# Create Fastlane directory for Android
mkdir -p android/fastlane

# Create Fastfile for Android
cat > android/fastlane/Fastfile << 'EOF'
default_platform(:android)

platform :android do
  desc "Build APK for internal testing"
  lane :internal do
    gradle(
      task: "assemble",
      build_type: "Release",
      project_dir: "."
    )
  end

  desc "Build AAB for Play Store"
  lane :play_store do
    gradle(
      task: "bundle",
      build_type: "Release",
      project_dir: "."
    )
  end

  desc "Upload to Play Store (Internal Track)"
  lane :upload_internal do
    internal
    
    upload_to_play_store(
      track: "internal",
      aab: "../build/app/outputs/bundle/release/app-release.aab",
      skip_upload_metadata: true,
      skip_upload_screenshots: true,
      skip_upload_images: true
    )
  end

  desc "Upload to Play Store (Production)"
  lane :upload_production do
    play_store
    
    upload_to_play_store(
      track: "production",
      aab: "../build/app/outputs/bundle/release/app-release.aab",
      skip_upload_metadata: false,
      skip_upload_screenshots: false,
      skip_upload_images: false
    )
  end

  desc "Promote internal to production"
  lane :promote do
    upload_to_play_store(
      track: "internal",
      track_promote_to: "production",
      skip_upload_aab: true,
      skip_upload_apk: true
    )
  end

  error do |lane, exception|
    # This block is called if there was an error in the lane
    Slack::Notifier.new(
      ENV["SLACK_WEBHOOK_URL"],
      channel: "#builds",
      message: "Android build failed: #{exception.message}"
    ).ping if ENV["SLACK_WEBHOOK_URL"]
  end
end
EOF

# Create Appfile for Android
cat > android/fastlane/Appfile << 'EOF'
json_key_file(ENV["GOOGLE_PLAY_JSON_KEY_PATH"])
package_name("com.souliyapps.mobile_flutter")
EOF

echo "✅ Android Fastlane configuration created"
echo ""
echo "📋 Next Steps:"
echo "  1. Get Google Play JSON key:"
echo "     - Go to Google Play Console → Settings → API → Service Accounts"
echo "     - Create service account with 'Service Account User' role"
echo "     - Download JSON key file"
echo ""
echo "  2. Set environment variable:"
echo "     export GOOGLE_PLAY_JSON_KEY_PATH='/path/to/your-key.json'"
echo ""
echo "  3. Build commands:"
echo "     cd android && fastlane internal    # Build APK"
echo "     cd android && fastlane play_store  # Build AAB"
echo "     cd android && fastlane upload_internal  # Upload to internal track"
