# How to Build Tattletale Desktop App (DMG)

## For the Developer Building the DMG

You need to build the DMG file ONCE on a Mac, then users can just download and install it.

### Steps to Build:

1. **On a Mac computer**, open Terminal

2. **Navigate to project folder:**
   ```bash
   cd /path/to/tattletale
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Build the DMG:**
   ```bash
   npm run package:mac
   ```

5. **Find your DMG files in the `dist` folder:**
   - `Tattletale-1.0.0-arm64.dmg` (for M1/M2/M3 Macs)
   - `Tattletale-1.0.0-x64.dmg` (for Intel Macs)

6. **Upload these DMG files** to:
   - Your website
   - GitHub Releases
   - Dropbox/Google Drive
   - Any file hosting service

---

## For End Users (The Easy Part!)

### How to Install Tattletale (No Terminal Needed):

1. **Download** the DMG file
   - For M1/M2/M3 Mac: Download `Tattletale-1.0.0-arm64.dmg`
   - For Intel Mac: Download `Tattletale-1.0.0-x64.dmg`

2. **Double-click** the downloaded DMG file

3. **Drag** the Tattletale icon to the Applications folder

4. **Done!** Open Tattletale from:
   - Applications folder
   - Launchpad
   - Spotlight (press ⌘+Space, type "Tattletale")

### First Time Opening:

If you see "Tattletale cannot be opened because it's from an unidentified developer":

1. Right-click (or Control+click) on Tattletale in Applications
2. Select "Open"
3. Click "Open" in the dialog
4. Tattletale will open and remember this choice

That's it!

---

## Distribution Options

Once you build the DMG, you can distribute it by:

### Option 1: Direct Download Link
Upload the DMG to your web server and add a download button:
```html
<a href="/downloads/Tattletale-1.0.0-arm64.dmg" download>
  Download for Mac (Apple Silicon)
</a>
```

### Option 2: GitHub Releases
1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Upload both DMG files
4. Users can download from: `github.com/yourname/tattletale/releases`

### Option 3: Cloud Storage
Upload to Dropbox, Google Drive, or OneDrive and share the public link.

---

## Updating the App

To release a new version:

1. Update version in `package.json`
2. Rebuild: `npm run package:mac`
3. Upload new DMG files
4. Users download and install like before (it overwrites the old version)

## Code Signing (Optional, for removing security warnings)

To remove the "unidentified developer" warning, you need an Apple Developer account ($99/year) and code signing. This is optional but recommended for production apps.
