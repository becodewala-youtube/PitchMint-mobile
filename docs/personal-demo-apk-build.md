# PitchMint Mobile — Personal Demo APK Build & Installation Guide

This guide details the procedure for building and installing a standalone Android APK (`preview` profile) for private personal testing and stakeholder demos.

---

## 1. Architectural & Security Architecture

### A. Android Package & App Naming
- **Android Package Identifier:** `com.pitchmint.app` (configured in `app.json`).
- **User-Facing App Name:** `PitchMint` (displays under launcher icon on Android).
- **Project Slug:** `PitchMint-mobile`.

### B. Backend API Connectivity (`EXPO_PUBLIC_API_URL`)
- Mobile endpoints append `/api/...` internally.
- **Rule:** Never include a trailing `/api` suffix in `EXPO_PUBLIC_API_URL`.
  - Correct: `http://192.168.1.100:4000` or `https://backend.pitchmint.com`
  - Incorrect: `http://192.168.1.100:4000/api`
- Automatic sanitization (`sanitizeApiUrl` in `src/config/env.ts`) safely strips any accidental trailing slashes or `/api` suffixes as a defense-in-depth measure.

### C. Network Cleartext Policy (Local HTTP vs. HTTPS)
- Android 9+ (API 28+) blocks plain HTTP (`http://`) cleartext network traffic by default.
- **Preview Demo Solution:** A targeted Expo config plugin (`plugins/withCleartextTraffic.js`) conditionally sets `android:usesCleartextTraffic="true"` only when `EAS_BUILD_PROFILE === 'preview'` or `EXPO_PUBLIC_ALLOW_CLEARTEXT === 'true'`.
- **Production Safety:** Production builds enforce strict HTTPS encryption; cleartext remains disabled.
- **Recommended HTTPS Alternative:** If you prefer avoiding plain HTTP over Wi-Fi, you can expose your local backend via an HTTPS tunnel (e.g. ngrok: `ngrok http 4000`) and set `EXPO_PUBLIC_API_URL=https://<your-id>.ngrok-free.app`.

### D. Demo Credit Top-Up Gating
- `eas.json` sets `EXPO_PUBLIC_ENABLE_DEMO_TOPUP: "true"` for the `preview` profile.
- In `production`, `EXPO_PUBLIC_ENABLE_DEMO_TOPUP` defaults to `"false"`.
- Backend safety: `PitchMint-Backend` doubly protects `POST /api/credits/simulate-payment-success` by only mounting the route and allowing execution when `NODE_ENV === 'development' || NODE_ENV === 'test'`.

### E. Zero Backend Secrets
- Mobile APK bundles are public client binaries. No MongoDB connection strings, JWT secrets, Gemini API keys, or Razorpay secrets are placed in mobile code or environment variables.

---

## 2. Interactive Steps Overview

| Step | Action | Requires Interactive Sign-in / Approval / Device? |
| :--- | :--- | :--- |
| **Step 1** | Pull & install dependencies | Automated (command line) |
| **Step 2** | Sign in to Expo account | **Interactive Sign-In** (browser or CLI prompt) |
| **Step 3** | Link EAS project (`eas init`) | **Interactive Approval** (link to your Expo account) |
| **Step 4** | Configure preview env variables | Automated / Local command |
| **Step 5** | Run pre-build verification | Automated (command line) |
| **Step 6** | Start EAS build | **Interactive Approval** (generate EAS keystore on first build) |
| **Step 7** | Install APK on phone | **Physical Phone** (download, allow unknown sources, launch) |

---

## 3. Step-by-Step PowerShell Execution Instructions

Execute these commands in Windows PowerShell from the `PitchMint-mobile/` directory:

### Step 1: Pull Merged Main & Install Dependencies
```powershell
# Ensure you are on updated main
git checkout main
git pull origin main

# Cleanly install locked dependencies
npm ci
```

### Step 2: Sign In to Expo Account
```powershell
# Interactive sign-in: enter your Expo username/email and password
npx eas-cli login

# Verify active account
npx eas-cli whoami
```
*(Requires your personal Expo account credentials).*

### Step 3: Initialize / Link the EAS Project
```powershell
# Links this repository to your Expo dashboard and writes genuine projectId to app.json
npx eas-cli init
```
*(Interactive prompt: select "Create a new project" or choose your existing Expo organization/account).*

### Step 4: Configure Preview Environment Variables
Determine your backend host address:
- **Option A (Physical phone on same Wi-Fi):** Find your PC's LAN IP using `ipconfig` (IPv4 address, e.g. `192.168.1.50`).
- **Option B (HTTPS Tunnel - Recommended):** Run `ngrok http 4000` or Cloudflare Tunnel and copy the HTTPS URL.

Configure the variable for EAS build:
```powershell
# Example for LAN Wi-Fi (replace with your actual PC Wi-Fi IP):
npx eas-cli env:create preview --variable-name EXPO_PUBLIC_API_URL --variable-value "http://192.168.1.50:4000" --type string --visibility plaintext

# Or if using an HTTPS tunnel:
# npx eas-cli env:create preview --variable-name EXPO_PUBLIC_API_URL --variable-value "https://xxxx-xx-xx.ngrok-free.app" --type string --visibility plaintext
```
*(Alternatively, create a local `.env.local` file with `EXPO_PUBLIC_API_URL=http://<IP>:4000` if running EAS build locally).*

### Step 5: Run Pre-Build Verification Checks
```powershell
# 1. Strict TypeScript type check
npm run typecheck

# 2. Automated Jest test suite
npm test

# 3. Expo SDK diagnostics
npm run doctor

# 4. Dependency alignment check
npx expo install --check

# 5. Android bundle compilation check
npx expo export --platform android
```
All checks must pass before starting the build.

### Step 6: Start EAS Android APK Build
```powershell
# Triggers cloud build producing directly installable Android APK
npx eas-cli build --profile preview --platform android
```
- **Signing Keystore Prompt:** EAS will prompt: *"Generate a new Android Keystore?"*. Select **Yes** (EAS-managed credentials).
- The build will compile on Expo EAS cloud infrastructure (typically 5-10 minutes).
- When completed, EAS outputs a direct `.apk` download URL and QR code in terminal.

### Step 7: Download & Install on Physical Android Device
1. **Download:** Open the APK link in your phone's browser or scan the terminal QR code.
2. **Install Unknown Apps Permission:**
   - Android will prompt *"For your security, your phone is not allowed to install unknown apps from this source"*.
   - Tap **Settings** -> Toggle **Allow from this source**.
3. **Install:** Tap **Install** -> Tap **Open**.
4. **Verify Connectivity:**
   - Ensure `PitchMint-Backend` is running (`npm run dev` in `PitchMint-Backend`).
   - If using Wi-Fi LAN IP, verify phone and PC are connected to the same Wi-Fi network.
   - If using Windows, ensure Windows Defender Firewall allows Node.js inbound connections on port 4000.

---

## 4. Verification & Common Troubleshooting

### Inbound Firewall on Windows (Port 4000)
If the phone displays `Network request failed` while on the same Wi-Fi:
```powershell
# Open Windows Defender Firewall for port 4000 (run as Administrator if needed):
New-NetFirewallRule -DisplayName "PitchMint Backend 4000" -Direction Inbound -LocalPort 4000 -Protocol TCP -Action Allow
```

### Checking Build Logs
If a build fails on EAS:
```powershell
npx eas-cli build:list
npx eas-cli build:view <BUILD_ID>
```
