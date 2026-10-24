# PitchMint Mobile — Personal Demo APK Build & Installation Guide

This guide details the procedure for building and installing a standalone Android APK (`preview` profile) for private personal testing and stakeholder demos, connected to the live PitchMint backend.

---

## 1. Architectural & Security Architecture

### A. Android Package & App Naming
- **Android Package Identifier:** `com.pitchmint.app` (configured in `app.json`).
- **User-Facing App Name:** `PitchMint` (displays under launcher icon on Android).
- **Project Slug:** `PitchMint-mobile`.
- **Target Expo Account:** `antik8795`.

### B. Backend API Connectivity (`EXPO_PUBLIC_API_URL`)
- **Target Endpoint:** `https://pitch-mint-backend.vercel.app`
- **Database:** Connects through the live backend to the production MongoDB database shared with the PitchMint website.
- Mobile endpoints append `/api/...` internally.
- **Rule:** Never include a trailing `/api` suffix in `EXPO_PUBLIC_API_URL`.
  - Configured: `https://pitch-mint-backend.vercel.app`
  - Internal Request: `https://pitch-mint-backend.vercel.app/api/auth/login`
- Automatic sanitization (`sanitizeApiUrl` in `src/config/env.ts`) safely strips any accidental trailing slashes or `/api` suffixes as a defense-in-depth measure.

### C. Network Cleartext Policy (Strict HTTPS)
- Because the live backend is hosted on secure HTTPS (`https://pitch-mint-backend.vercel.app`), cleartext HTTP is **disabled** (`EXPO_PUBLIC_ALLOW_CLEARTEXT: "false"` in `eas.json`).
- The config plugin (`plugins/withCleartextTraffic.js`) only permits cleartext HTTP if `EXPO_PUBLIC_ALLOW_CLEARTEXT === 'true'` is explicitly configured, ensuring that preview APK builds maintain strict HTTPS security by default.

### D. Demo Credit Top-Up Gating
- Gated to disabled (`EXPO_PUBLIC_ENABLE_DEMO_TOPUP: "false"` in `eas.json` for both `preview` and `production` profiles).
- The demo credit purchase controls remain hidden, and the app reflects genuine MongoDB user credit quotas.

### E. Zero Backend Secrets
- Mobile APK bundles are public client binaries. No MongoDB connection strings, JWT secrets, Gemini API keys, or Razorpay secrets are placed in mobile code or environment variables.

---

## 2. Interactive Steps Overview

| Step | Action | Requires Interactive Sign-in / Approval / Device? |
| :--- | :--- | :--- |
| **Step 1** | Pull & install dependencies | Automated (command line) |
| **Step 2** | Sign in to Expo account (`antik8795`) | **Interactive Sign-In** (browser or CLI prompt) |
| **Step 3** | Link EAS project (`eas init`) | **Interactive Approval** (link to your Expo account) |
| **Step 4** | Verify preview configuration | Automated / Pre-configured in `eas.json` |
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

### Step 2: Sign In to Expo Account (`antik8795`)
```powershell
# Interactive sign-in: enter your Expo username/email (antik8795) and password
npx eas-cli login

# Verify active account shows antik8795
npx eas-cli whoami
```
*(Requires your personal Expo account credentials).*

### Step 3: Initialize / Link the EAS Project
```powershell
# Links this repository to your Expo dashboard and writes genuine projectId to app.json
npx eas-cli init
```
*(Interactive prompt: select "Create a new project" or choose your `antik8795` Expo account).*

### Step 4: Verify Preview Configuration
`eas.json` is already pre-configured for the live backend:
- `EXPO_PUBLIC_API_URL`: `https://pitch-mint-backend.vercel.app`
- `EXPO_PUBLIC_ENABLE_DEMO_TOPUP`: `false`
- `EXPO_PUBLIC_ALLOW_CLEARTEXT`: `false`

*(No manual EAS environment variable creation is required).*

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
   - Sign in with your existing PitchMint web account or register a new founder account.
   - All evaluations and credits will synchronize in real-time with the live MongoDB database.

---

## 4. Verification & Common Troubleshooting

### Checking Build Logs
If a build fails or you want to track progress:
```powershell
npx eas-cli build:list
npx eas-cli build:view <BUILD_ID>
```
