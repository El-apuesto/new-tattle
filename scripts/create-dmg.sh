#!/bin/bash

set -e

echo "Creating Tattletale.app bundle..."

APP_NAME="Tattletale"
DIST_DIR="dist-mac"
APP_DIR="$DIST_DIR/$APP_NAME.app"
CONTENTS_DIR="$APP_DIR/Contents"
MACOS_DIR="$CONTENTS_DIR/MacOS"
RESOURCES_DIR="$CONTENTS_DIR/Resources"

rm -rf "$DIST_DIR"
mkdir -p "$MACOS_DIR"
mkdir -p "$RESOURCES_DIR"

cp -r dist/* "$RESOURCES_DIR/"
cp -r electron/* "$RESOURCES_DIR/"

cp public/1050BA42-9FD6-4C40-91DD-01518B30FCDC.png "$RESOURCES_DIR/icon.png"

cat > "$MACOS_DIR/$APP_NAME" << 'EOF'
#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR/../Resources"
/usr/local/bin/node main.js || /opt/homebrew/bin/node main.js || node main.js
EOF

chmod +x "$MACOS_DIR/$APP_NAME"

cat > "$CONTENTS_DIR/Info.plist" << EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleExecutable</key>
    <string>$APP_NAME</string>
    <key>CFBundleIconFile</key>
    <string>icon.png</string>
    <key>CFBundleIdentifier</key>
    <string>com.tattletale.app</string>
    <key>CFBundleName</key>
    <string>$APP_NAME</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1.0.0</string>
    <key>LSMinimumSystemVersion</key>
    <string>10.13</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
EOF

echo "Creating DMG..."

if command -v hdiutil &> /dev/null; then
    DMG_NAME="Tattletale-1.0.0-universal.dmg"

    hdiutil create -volname "$APP_NAME" -srcfolder "$DIST_DIR" -ov -format UDZO "$DMG_NAME"

    echo "✅ DMG created: $DMG_NAME"
    echo "📦 Size: $(du -h "$DMG_NAME" | cut -f1)"
else
    echo "⚠️  hdiutil not found. Creating ZIP instead..."
    cd "$DIST_DIR"
    zip -r "../Tattletale-1.0.0-universal.zip" "$APP_NAME.app"
    cd ..
    echo "✅ ZIP created: Tattletale-1.0.0-universal.zip"
fi

echo ""
echo "🎉 Build complete! Users can now:"
echo "1. Download the DMG/ZIP file"
echo "2. Double-click to open"
echo "3. Drag Tattletale to Applications"
echo "4. Done!"
