# Tattletale Desktop App

## Building the macOS Desktop App

### Prerequisites
- Node.js and npm installed
- macOS (for building .dmg and .app)
- Xcode Command Line Tools installed

### Build Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Generate App Icons**
   ```bash
   npm run generate:icons
   ```
   This converts the Tattletale logo into macOS ICNS format.

3. **Build the Desktop App**
   ```bash
   npm run package:mac
   ```
   This will:
   - Generate the app icons
   - Build the web app
   - Package it as a macOS application
   - Create both Intel (x64) and Apple Silicon (arm64) versions
   - Generate a DMG installer

### Output

After building, you'll find the following in the `dist` folder:
- `Tattletale-1.0.0-arm64.dmg` - Apple Silicon installer
- `Tattletale-1.0.0-x64.dmg` - Intel Mac installer
- `Tattletale-1.0.0-arm64-mac.zip` - Apple Silicon app (portable)
- `Tattletale-1.0.0-x64-mac.zip` - Intel Mac app (portable)

### Installation

1. Double-click the DMG file
2. Drag the Tattletale app to the Applications folder
3. Launch from Applications or Spotlight

### Features

The desktop app includes:
- Native macOS window management
- Desktop icon using the Tattletale logo
- Offline-capable once installed
- System tray integration
- Auto-updates support (when configured)

### Development Mode

To run the app in development:
```bash
# Terminal 1: Start Vite dev server
npm run dev

# Terminal 2: Start Electron
npm run electron
```
