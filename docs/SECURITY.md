# PitchMint Mobile — Security Architecture & Operational Guide

This document is the authoritative security reference for `PitchMint-mobile` (React Native + Expo SDK 58 Android-first client).

---

## 1. Security Architecture

### 1.1 Mobile Trust Boundary
- **Public Client Model:** Mobile application binaries (`.apk` / `.aab` / `.ipa`) and JavaScript/Hermes bundles (`assets/index.android.bundle`) are distributed to end-user devices and can be unpacked, inspected, or tampered with.
- **No Client-Side Authority:** Client-side validation, UI locks, credit confirmation modals (`CreditConfirmationModal`), and premium badges are **UX safeguards only**. They are never security boundaries.
- **Authoritative External Backend:** PitchMint Mobile communicates strictly over HTTPS with an external backend API (`EXPO_PUBLIC_API_URL`, defaulting to `https://pitch-mint-backend.vercel.app`). The backend is the sole authority for:
  - Authentication, password verification, OTP verification, and Google ID token verification.
  - Session JWT issuance and expiration checks.
  - Resource ownership (`GET/DELETE /api/idea/:id`, deck/canvas/competitor/simulator routes).
  - Real-time credit balance checks, atomic deductions, rate limiting, and rollback/refund handling.
  - Premium entitlement enforcement (e.g., `GET /api/investors` HTTP 403 checks).

### 1.2 Credential & Preference Storage
- **Session JWTs (`src/services/storage/tokenStorage.ts`):**
  - Stored exclusively in `expo-secure-store` under key `pitchmint_auth_token` (`keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK` on iOS; Android Keystore-backed `EncryptedSharedPreferences` on Android).
  - **Fail-Closed Native Policy:** On iOS and Android, `tokenStorage` never mirrors JWTs into JS memory and never falls back to plaintext storage when SecureStore fails. Failures raise sanitized `TokenStorageError` codes (`GET_FAILED`, `SET_FAILED`, `DELETE_FAILED`).
  - **In-Memory Non-Native Fallback:** Only non-native platforms (`web` / Jest Node runners) use an in-memory map.
  - **Known Upstream Limitation (`AUTH-02`):** See [`docs/known-issues.md`](known-issues.md) regarding `expo-secure-store@58.0.3` Android `SharedPreferences.Editor.commit()` check pending an SDK-58 upstream release.
- **Non-Sensitive Preferences:**
  - `onboardingStorage.ts` (`pitchmint_onboarding_completed`) and `downloadStorage.ts` (`pitchmint_pdf_download_dir_uri`) store non-credential UX flags/URIs in `SecureStore` with memory fallback.

### 1.3 Build Environment Separation (`eas.json`)
| Profile | Purpose | `EXPO_PUBLIC_API_URL` | `EXPO_PUBLIC_ALLOW_CLEARTEXT` | `EXPO_PUBLIC_ENABLE_DEMO_TOPUP` |
| :--- | :--- | :--- | :--- | :--- |
| `development` | Local dev client (`expo-dev-client`) | Configured in `.env.local` | Opt-in only via `.env.local` | Defaults to `__DEV__` (`true`) |
| `preview` | Internal APK testing against live backend | `https://pitch-mint-backend.vercel.app` | `"false"` (enforced) | `"false"` (enforced) |
| `production` | Store / production release | `https://pitch-mint-backend.vercel.app` | `"false"` (enforced) | `"false"` (enforced) |

---

## 2. Secret Management

### 2.1 Public Configuration vs. Private Secrets
Variables prefixed with `EXPO_PUBLIC_` are inlined directly into the client JavaScript/Hermes bundle at build time.

- **Safe in `EXPO_PUBLIC_*`:**
  - `EXPO_PUBLIC_API_URL` — Public backend base URL (`https://pitch-mint-backend.vercel.app`).
  - `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` — Public OAuth 2.0 Web Client ID (`<PROJECT_NUMBER>-<HASH>.apps.googleusercontent.com`) used by Android Credential Manager to request an ID token for the backend.
  - `EXPO_PUBLIC_ENABLE_DEMO_TOPUP` — Non-authoritative UI visibility flag (`"false"` in preview/production; backend still enforces `NODE_ENV` checks on `/api/credits/simulate-payment-success`).
  - `EXPO_PUBLIC_ALLOW_CLEARTEXT` — Local-dev-only Android manifest toggle (`"false"` by default; blocked in preview and production).
- **Strictly Forbidden in Client Code or `.env*`:**
  - Server secrets (`JWT_SECRET`, `GEMINI_API_KEY`, `RAZORPAY_KEY_SECRET`).
  - Database URIs (`mongodb://`, `mongodb+srv://`) or database credentials.
  - Google OAuth **Client Secrets** (`GOCSPX-...`) or Firebase/GCP service account JSON keys.
  - Signing keystores (`.jks`, `.keystore`), private keys (`.pem`, `.key`, `.p8`, `.p12`), or personal access tokens (`ghp_`, `github_pat_`).

> **Important:** A Google OAuth **Client ID** is a public client identifier required by native mobile OAuth flows. A Google OAuth **Client Secret** is a private server credential and must never exist in `PitchMint-mobile`.

### 2.2 Environment File Policy (`.env` / `.env.local` / `.env.example` / EAS)
- **`.env` is NOT tracked in Git:** `.gitignore` excludes `.env`, `.env.local`, `.env.development.local`, `.env.production.local`, `.env.test.local`, and `.env*.local`.
- **`.env.example` IS tracked:** Contains safe public defaults and empty placeholders (never real credentials).
- **Local Development:** Copy `.env.example` to `.env` or `.env.local` for local machine configuration (e.g., `http://10.0.2.2:4000` + `EXPO_PUBLIC_ALLOW_CLEARTEXT=true` when testing against a local HTTP backend).
- **EAS Builds:** Configure release/preview environment variables in `eas.json` (for public non-secret values) or EAS Environment Variables/Secrets in the Expo dashboard (never commit private values to Git).

---

## 3. Authentication & Session Handling

- **JWT Lifecycle:**
  1. Sign-in (`POST /api/auth/signin`), email verification (`POST /api/auth/verify-email`), or Google Sign-In (`POST /api/auth/google`) returns `{ token, user }`.
  2. `AuthContext` persists `token` via `tokenStorage.setToken(response.token)` **before** setting authenticated React state (`setToken`, `setUser`). If `SecureStore` fails, login halts and does not enter an authenticated state.
  3. `apiClient.ts` reads the token from `tokenStorage.getToken()` per authenticated request and sends `Authorization: Bearer <token>`. Tokens are never placed in URL query strings.
- **Session Restoration (`bootstrapAuth`):**
  - Single-flight guarded on launch while `AuthLoadingScreen` prevents flashing protected or auth screens.
  - On `401 Unauthorized`, `AuthContext` clears the stored token via `tokenStorage.removeToken()` (or marks `pendingTokenCleanupRef` for retry if deletion fails).
  - On transient network/5xx errors, `AuthContext` locks protected routes behind `AuthLoadingScreen` recovery UI without deleting a potentially valid token.
- **401 Interception & Logout:**
  - `apiClient.ts` invokes the global 401 handler on non-auth endpoints to immediately clear in-memory session state and purge `tokenStorage`.
  - `signOut` deletes the stored token first and propagates `TokenStorageError` if deletion fails so callers never observe a false-success logout (`ProfileScreen` surfaces retry UI).
- **Google Sign-In Status:**
  - Native Android Credential Manager integration is implemented and unit-tested in `src/services/auth/googleAuthService.ts` using `react-native-nitro-google-signin`.
  - Live device verification remains **pending external Google Cloud Console OAuth setup** (package `com.pitchmint.app`, Android SHA-1 fingerprint, and Web Client ID). See [`docs/google-sign-in-setup.md`](google-sign-in-setup.md).
- **Logging Restrictions:**
  - Never log passwords, JWTs, Google ID tokens, OTP/reset codes, email addresses, or user startup ideas.
  - All diagnostic warnings must use `logDevWarning` (`src/utils/logger.ts`), which is silent when `__DEV__ === false` and outputs only sanitized error classifications (`TokenStorageError.code`, `HTTP_<status>`, `Error.name`).

---

## 4. Network & Android Security

### 4.1 HTTPS & Cleartext Protection
- `src/config/env.ts` validates that `EXPO_PUBLIC_API_URL` uses `http://` or `https://` without embedded credentials, and **refuses `http://` when `__DEV__ === false`** (falling back to `DEFAULT_API_URL`).
- `plugins/withCleartextTraffic.js` only injects `android:usesCleartextTraffic="true"` when `EXPO_PUBLIC_ALLOW_CLEARTEXT === 'true'` **and** `EAS_BUILD_PROFILE` is neither `'preview'` nor `'production'` **and** `NODE_ENV !== 'production'`.
- Android `targetSdkVersion` is 36 (Android defaults `usesCleartextTraffic` to `false` on API 28+). No custom `TrustManager`, `SSLSocketFactory`, or TLS bypass exists anywhere in the repository.

### 4.2 Android Manifest, Permissions & Backups
- **Permission Minimization:** `plugins/withAndroidSecurityHardening.js` strips `android.permission.SYSTEM_ALERT_WINDOW` in `preview` and `production` builds while retaining it in `development` for `expo-dev-client` debugging overlays.
- **Expected Release Permissions (`com.pitchmint.app`):**
  - `android.permission.INTERNET` — Required for backend HTTPS requests.
  - `android.permission.READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` (`maxSdkVersion="32"`) — Added by `expo-file-system` for legacy Android storage compatibility.
  - `android.permission.VIBRATE` — Standard Expo runtime template permission.
  - `android.permission.USE_BIOMETRIC` / `USE_FINGERPRINT` — Merged from AndroidX Biometric / `expo-secure-store`.
  - `com.pitchmint.app.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION` — Merged from AndroidX Core.
- **Backup Exclusion Policy:** `expo-secure-store` configures `secure_store_backup_rules.xml` and `secure_store_data_extraction_rules.xml` to explicitly exclude `domain="sharedpref" path="SecureStore"` from both cloud backups and device-to-device transfers. Cached PDFs live in `Paths.cache`, which Android excludes from backups.

### 4.3 Deep Links, External URLs & File Sharing
- **External URL Validation (`src/utils/safeLinking.ts`):** All external links (`ProfileScreen` legal URLs, `InvestorDirectoryScreen` websites) pass through `validateExternalUrl` / `openSafeExternalUrl` before calling `Linking.openURL`. Dangerous schemes (`javascript:`, `data:`, `file:`, `intent:`, `content:`, `tel:`), embedded credentials, and control characters are rejected.
- **FileProviders:** `FileSystemFileProvider`, `SharingFileProvider`, and `ClipboardFileProvider` are generated with `android:exported="false"` and `android:grantUriPermissions="true"`.
- **PDF Generation & Temp Cleanup:** `pdfTemplate.ts` and `canvasPdfTemplate.ts` escape all user-controlled fields via `escapeHtml()`. `pdfExport.ts` and `canvasPdfExport.ts` sanitize filenames, validate `%PDF-` / `%%EOF` / page counts, write permanent downloads strictly via user-authorized Android SAF (`StorageAccessFramework`), and delete intermediate temporary print files in `Paths.cache`.

---

## 5. Security Development Checklist

Before opening a PR or building a release/preview artifact:

- [ ] Verify `.env` is untracked (`git ls-files .env` returns empty) and no secrets exist in staged changes.
- [ ] Confirm all new `EXPO_PUBLIC_*` variables contain public client configuration only.
- [ ] Verify authentication tokens are read/written exclusively via `tokenStorage` (`expo-secure-store`).
- [ ] Verify new external URLs use `openSafeExternalUrl` (`src/utils/safeLinking.ts`) and HTML/PDF templates escape user inputs (`escapeHtml`).
- [ ] Verify no raw `console.log` / `console.warn` / `console.error` leaks tokens, PII, URLs, or payloads; use `logDevWarning`.
- [ ] Verify client credit confirmations/flags remain UX safeguards only and backend remains authoritative.
- [ ] Run the full verification suite:
  ```bash
  npm run security:check
  npm run typecheck
  npm test
  npm run doctor
  npx expo install --check
  npm run export:android
  npm audit --audit-level=high
  ```

---

## 6. Vulnerability & Credential Incident Response

If a secret, private key, or credential is discovered in the working tree or Git history:

1. **Do not copy, print, or share the credential** in terminal output, tickets, screenshots, or reports.
2. **Identify the affected service, file path, and commit SHA(s).**
3. **Assess whether the credential is still active** and determine its blast radius.
4. **Notify the project owner immediately.**
5. **Rotate or revoke the credential with owner authorization** (never rotate production keys autonomously).
6. **Review Git history impact** across all branches and tags (`git log --all --full-history`).
7. **Remove the exposed value safely** from tracked files and prepare a coordinated history-rewrite plan (`git filter-repo` / force-push coordination) if historical scrubbing is approved by the owner.
8. **Add a regression prevention rule** in `scripts/security-check.mjs` and `.gitignore`.
9. **Record the incident** (commit SHA, rule triggered, rotation confirmation date) without retaining the secret value.
