#!/bin/bash

mkdir -p build

SOURCE_PNG="public/1050BA42-9FD6-4C40-91DD-01518B30FCDC.png"

cp "$SOURCE_PNG" build/icon.png

if command -v sips &> /dev/null && command -v iconutil &> /dev/null; then
  echo "Generating macOS ICNS icon..."

  ICONSET_DIR="build/icon.iconset"
  mkdir -p "$ICONSET_DIR"

  sips -z 16 16     "$SOURCE_PNG" --out "$ICONSET_DIR/icon_16x16.png"
  sips -z 32 32     "$SOURCE_PNG" --out "$ICONSET_DIR/icon_16x16@2x.png"
  sips -z 32 32     "$SOURCE_PNG" --out "$ICONSET_DIR/icon_32x32.png"
  sips -z 64 64     "$SOURCE_PNG" --out "$ICONSET_DIR/icon_32x32@2x.png"
  sips -z 128 128   "$SOURCE_PNG" --out "$ICONSET_DIR/icon_128x128.png"
  sips -z 256 256   "$SOURCE_PNG" --out "$ICONSET_DIR/icon_128x128@2x.png"
  sips -z 256 256   "$SOURCE_PNG" --out "$ICONSET_DIR/icon_256x256.png"
  sips -z 512 512   "$SOURCE_PNG" --out "$ICONSET_DIR/icon_256x256@2x.png"
  sips -z 512 512   "$SOURCE_PNG" --out "$ICONSET_DIR/icon_512x512.png"
  sips -z 1024 1024 "$SOURCE_PNG" --out "$ICONSET_DIR/icon_512x512@2x.png"

  iconutil -c icns "$ICONSET_DIR" -o build/icon.icns

  rm -rf "$ICONSET_DIR"

  echo "ICNS icon created successfully!"
else
  echo "Warning: sips and iconutil not found. Icon conversion skipped."
  echo "Using PNG as fallback."
fi
