# PitchMint Mobile — Google Sign-In Setup & Configuration Guide

This guide details the prerequisites, Google Cloud Console setup, environment configuration, and verification steps for native Google Sign-In on PitchMint Mobile (Android first).

---

## 1. Readiness Status

| Level | Status | Notes |
| :--- | :--- | :--- |
| **Implemented** | Complete | Android Credential Manager flow via `react-native-nitro-google-signin` and `react-native-nitro-modules`. |
| **Unit-tested** | Complete | 36 dedicated unit tests covering token exchange, JWT persistence, cancellation, error codes, and button UI. |
| **Device-verified** | Pending | Requires Google Cloud OAuth credentials (Web Client ID and Android Client ID with SHA-1). |

---

## 2. Google Cloud Console Setup

### Step 1: Create or Select a Google Cloud Project
1. Navigate to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your PitchMint project or create a new one (e.g. `pitchmint-production`).

### Step 2: Configure the OAuth Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** (unless strictly internal to a Google Workspace organization).
3. Fill in required application details:
   - **App name:** `PitchMint`
   - **User support email:** Your support or admin email.
   - **Developer contact information:** Your developer contact email.
4. Save and continue through **Scopes** (`email`, `profile`, `openid`).
5. Under **Test users**, add the Google accounts you will use for testing during development.

---

## 3. Creating OAuth 2.0 Credentials

Native Google Sign-In requires **two distinct client IDs** in the same Google Cloud project:
1. A **Web application** client ID (used by the mobile app to request ID tokens and by the backend to verify them).
2. An **Android application** client ID (binds the Android package name and signing certificate SHA-1 fingerprint).

### Client 1: Web Application Client ID
1. Navigate to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **OAuth client ID**.
3. Set **Application type** to `Web application`.
4. Name: `PitchMint Web & Backend OAuth Client`.
5. Authorized JavaScript origins: Add your web frontend and backend URLs if applicable.
6. Click **Create**.
7. Copy the generated **Client ID** (format: `<PROJECT_NUMBER>-<HASH>.apps.googleusercontent.com`).

> **Note:** The backend environment variable `GOOGLE_CLIENT_ID` must match this exact Web Client ID. Note that a `google-services.json` file is **not required** when supplying the explicit Web Client ID to `react-native-nitro-google-signin`.

### Client 2: Android Application Client ID
1. In **APIs & Services** > **Credentials**, click **Create Credentials** > **OAuth client ID**.
2. Set **Application type** to `Android`.
3. Name: `PitchMint Android Client`.
4. **Package name:** `com.pitchmint.app` (must match `android.package` in [`app.json`](../app.json)).
5. **SHA-1 certificate fingerprint:** Enter your debug or release SHA-1 fingerprint (see Section 4 below).
6. Click **Create**.

---

## 4. Obtaining the Android Signing Certificate SHA-1

### Local Debug Keystore
To obtain the SHA-1 fingerprint for your local debug build:

**macOS / Linux:**
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Windows (PowerShell):**
```powershell
keytool -list -v -keystore "$env:USERPROFILE\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

Look for the line beginning with `SHA1:`:
```text
Certificate fingerprints:
     SHA1: AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD
```
Register this SHA-1 in the Android OAuth client on Google Cloud Console.

### Production / EAS Build Keystore
For EAS Cloud builds or Play Store production releases:
- Run `eas credentials` and inspect the Android Keystore SHA-1.
- If using Google Play App Signing, also register the **App signing key certificate SHA-1** from Google Play Console under **Setup** > **App signing**.

---

## 5. Mobile Environment Configuration

1. In the `PitchMint-mobile/` directory, create or edit your local environment file:
   ```bash
   # .env.local (ignored by git)
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<YOUR_WEB_CLIENT_ID>.apps.googleusercontent.com
   ```
2. Verify that the backend has matching configuration:
   ```bash
   # PitchMint Backend .env
   GOOGLE_CLIENT_ID=<YOUR_WEB_CLIENT_ID>.apps.googleusercontent.com
   ```

> **Security Mandate:** Never commit real OAuth client secrets or developer-specific `.env.local` files to version control. Only public `EXPO_PUBLIC_*` values may be compiled into client bundles.

---

## 6. Building and Running the Custom Android Development Client

Native Google Sign-In utilizes Android Credential Manager and native JSI Nitro modules, which are not available in standard Expo Go. It must be executed in a custom development build.

### Running with Local Emulator
1. Start an Android emulator with Google Play Services installed:
   ```bash
   emulator -avd <YOUR_AVD_NAME>
   ```
2. Launch the Android development build from `PitchMint-mobile/`:
   ```bash
   npm run android
   # or
   npx expo run:android
   ```
3. Expo will prebuild the native Android project and compile the debug APK via Gradle.
4. Metro bundler will start and connect to the running application.

---

## 7. Troubleshooting Common Errors

| Error Code / Symptom | Root Cause | Solution |
| :--- | :--- | :--- |
| `Google Sign-In Setup Required` | `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` is missing or empty. | Set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in `.env.local` and restart Metro. |
| `Google Play Services Required` | The emulator or physical device lacks Google Play Services or is outdated. | Use an emulator system image that includes Google Play Store (e.g. Google APIs or Google Play). |
| `DEVELOPER_ERROR` | Android package name (`com.pitchmint.app`) or SHA-1 fingerprint does not match the Google Cloud Android Client ID, or the Android Client ID was mistakenly used as `webClientId`. | Verify that `com.pitchmint.app` and your debug SHA-1 are registered in Google Cloud Console, and ensure `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` uses the **Web application** client ID. |
| `Invalid Google credential` (Backend 400) | Backend `GOOGLE_CLIENT_ID` does not match mobile `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, or token expired. | Confirm that both mobile `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` and backend `GOOGLE_CLIENT_ID` are set to the identical Web OAuth client ID. |
| User cancellation | User dismissed or cancelled the account picker sheet. | Handled gracefully and silently; no error alert is displayed. |
