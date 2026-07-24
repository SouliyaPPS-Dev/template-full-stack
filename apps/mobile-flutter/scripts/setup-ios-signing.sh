#!/bin/bash
set -e

# iOS Signing Setup Script
# Usage: ./scripts/setup-ios-signing.sh

echo "🔐 iOS Signing Setup"
echo "==================="

cd "$(dirname "$0")/.."

# Check if Fastlane is installed
if ! command -v fastlane &> /dev/null; then
    echo "❌ Fastlane not installed. Installing..."
    gem install fastlane
fi

# Create Fastlane directory
mkdir -p ios/fastlane

# Create Fastfile for iOS
cat > ios/fastlane/Fastfile << 'EOF'
default_platform(:ios)

platform :ios do
  desc "Build IPA for App Store"
  lane :app_store do
    # Increment build number
    increment_build_number(
      xcodeproj: "Runner.xcodeproj"
    )
    
    # Build the app
    build_app(
      workspace: "Runner.xcworkspace",
      scheme: "Runner",
      export_method: "app-store",
      output_directory: "../build/ios/ipa",
      output_name: "Runner.ipa"
    )
  end

  desc "Build IPA for Ad Hoc"
  lane :ad_hoc do
    increment_build_number(
      xcodeproj: "Runner.xcodeproj"
    )
    
    build_app(
      workspace: "Runner.xcworkspace",
      scheme: "Runner",
      export_method: "ad-hoc",
      output_directory: "../build/ios/ipa",
      output_name: "Runner-adhoc.ipa"
    )
  end

  desc "Build IPA for Development"
  lane :development do
    increment_build_number(
      xcodeproj: "Runner.xcodeproj"
    )
    
    build_app(
      workspace: "Runner.xcworkspace",
      scheme: "Runner",
      export_method: "development",
      output_directory: "../build/ios/ipa",
      output_name: "Runner-dev.ipa"
    )
  end

  desc "Upload to TestFlight"
  lane :testflight do
    app_store
    
    upload_to_testflight(
      skip_waiting_for_build_processing: true
    )
  end

  desc "Upload to App Store"
  lane :release do
    app_store
    
    upload_to_app_store(
      skip_screenshots: true,
      skip_metadata: false
    )
  end

  error do |lane, exception|
    # This block is called if there was an error in the lane
    Slack::Notifier.new(
      ENV["SLACK_WEBHOOK_URL"],
      channel: "#builds",
      message: "iOS build failed: #{exception.message}"
    ).ping if ENV["SLACK_WEBHOOK_URL"]
  end
end
EOF

# Create Matchfile for code signing
cat > ios/fastlane/Matchfile << 'EOF'
git_url(ENV["MATCH_GIT_URL"] || "git@github.com:your-org/your-certificates.git")
storage_mode("git")
type("appstore")
app_identifier(["com.souliyapps.mobile_flutter"])
EOF

# Create Deliverfile for App Store
cat > ios/fastlane/Deliverfile << 'EOF'
# App Store Connect configuration
app_identifier "com.souliyapps.mobile_flutter"
# app_id "1234567890"  # Your App Store Connect App ID
# team_id "ABC123DEF4"  # Your Apple Developer Team ID

# Submission settings
submit_for_review false
automatic_release false
# phased_release true
# skip_binary_upload false

# Screenshots
skip_screenshots true

# Metadata
skip_metadata false
EOF

echo "✅ Fastlane configuration created"
echo ""
echo "📋 Next Steps:"
echo "  1. Set environment variables:"
echo "     export MATCH_GIT_URL='git@github.com:your-org/your-certificates.git'"
echo "     export MATCH_PASSWORD='your-match-password'"
echo "     export APP_STORE_CONNECT_API_KEY_ID='your-key-id'"
echo "     export APP_STORE_CONNECT_API_ISSUER_ID='your-issuer-id'"
echo "     export APP_STORE_CONNECT_API_KEY='path/to/authkey.p8'"
echo ""
echo "  2. Run: cd ios && fastlane match appstore"
echo "  3. Build: make build-ipa"
echo ""
echo "  Or use Fastlane directly:"
echo "     cd ios && fastlane app_store"
echo "     cd ios && fastlane testflight"
