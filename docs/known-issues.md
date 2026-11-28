# PitchMint Mobile — Known Issues & Technical Debt Register

This document tracks verified limitations, technical debt, release prerequisites, and areas requiring future engineering investigation for `PitchMint-mobile`.

---

## 1. Technical Debt & Codebase Findings

### ENV-01: Tracked `.env` in Version Control
- **Category:** Repository Hygiene & Secret Management
- **Status:** Remediated (`.env` Untracked via `git rm --cached .env`; Full-History Scan Verified Clean of Private Secrets)
- **Evidence:**
  - Root `.env` was previously tracked in Git. It has been removed from Git tracking (`git rm --cached .env`) while preserving the developer's local `.env` file on disk.
  - [`.gitignore`](../.gitignore) now explicitly excludes `.env`, `.env.local`, `.env.development.local`, `.env.production.local`, `.env.test.local`, and `.env*.local`.
  - [`.env.example`](../.env.example) remains tracked with safe public defaults (`EXPO_PUBLIC_API_URL=https://pitch-mint-backend.vercel.app`, `EXPO_PUBLIC_ALLOW_CLEARTEXT=false`, `EXPO_PUBLIC_ENABLE_DEMO_TOPUP=false`, empty `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=`).
  - Full-history scan of all historical Git blobs confirmed zero private server secrets (`JWT_SECRET`, `GEMINI_API_KEY`, `RAZORPAY_KEY_SECRET`, database URIs, OAuth client secrets) were ever committed; only public `EXPO_PUBLIC_*` configuration and earlier local LAN dev URLs appeared in `.env` history.
  - [`scripts/security-check.mjs`](../scripts/security-check.mjs) (`npm run security:check`) enforces in CI that `.env` and `.env*.local` remain untracked.
- **Required Action:** None for credential rotation or history rewrite (no private secrets exposed). See [`docs/SECURITY.md`](SECURITY.md) for the authoritative `.env` and secret management policy.

### API-01: Missing Request Timeout & Cancellation Handling
- **Category:** Network Resilience & UX
- **Status:** Resolved / Implemented (Stage 5.1 & Stage 5.1.1)
- **Evidence:** [`src/services/api/apiClient.ts`](../src/services/api/apiClient.ts) and [`src/services/api/ideasApi.ts`](../src/services/api/ideasApi.ts) implement configurable request timeouts with explicit operation defaults (`DEFAULT_TIMEOUT_MS = 15000` for standard queries, `AI_GENERATION_TIMEOUT_MS = 60000` explicitly on the 5 credit-consuming endpoints: `submitIdea`, `generatePitchDeck`, `regeneratePitchDeck`, `generateCanvas`, `regenerateCanvas`), caller timeout overrides, response-body stream timeout protection, and API-level `AbortSignal` cancellation support.
- **Assessment:** Distinguishes `TIMEOUT` and `CANCELLED` errors from ordinary network failures (`status: 0, code: NETWORK_ERROR`) and HTTP errors. Credit-consuming operations enforce strict non-retry policies, preserve user inputs, and guide users to check Saved Ideas / idea status rather than re-submitting immediately. Generation status recovery uses conservative content-comparison fallback because the backend Idea schema lacks generation-specific version or timestamp markers. Caller-provided `AbortSignal` provides API-level cancellation capability (no automatic unmount cancellation on credit mutations or UI cancel button is implemented).
- **Required Action:** Resolved in mobile client. Note that client-side request timeouts do not guarantee backend cancellation or transaction rollback (see API-02).

### UX-01: Inconsistent Credit Consumption Confirmation & Balance Authority
- **Category:** UX Consistency & Accidental Deduction Prevention
- **Status:** Resolved / Implemented (Pre-Flight Confirmation Modal Added)
- **Evidence:**
  - `PitchDeckScreen.tsx`: Displays an explicit confirmation modal before deducting 1 credit for regeneration.
  - `CanvasScreen.tsx`: Displays an explicit confirmation modal before deducting 1 credit for generation/regeneration.
  - `IdeaDetailsScreen.tsx`: Displays confirmation modals before generating decks or canvases.
  - `ValidateModalScreen.tsx`: Displays an explicit pre-flight confirmation modal (`confirm-validation-button` / `cancel-validation-button`) presenting the 1-credit cost, current balance, remaining balance feedback, and duplicate tap protection before calling `POST /api/idea/submit`.
- **Architectural Principles & Assessment:**
  - **Confirmation as UX Safeguard:** Before a credit-consuming user action, the application presents an explicit confirmation modal showing the operation and its credit cost. It displays the current credit balance and the estimated post-operation balance. This modal is strictly a client UX safeguard against accidental button presses, not a substitute for server-side authorization.
  - **Non-Guaranteed Client Balance:** Any credit balance displayed in the mobile client may be cached, optimistic, or outdated; it is not guaranteed to represent the server's latest authoritative balance.
  - **Authoritative Backend Responsibility:** The backend server is strictly authoritative for:
    - User authentication and authorization.
    - Idea ownership and permissions.
    - Real-time credit availability verification.
    - Atomic credit deduction.
    - Transaction rollback and refund behavior upon processing failures.
    *(Note: Backend behavior has not been independently audited in this mobile task; refund and rollback mechanisms are documented as server responsibilities without claiming that every current backend route has been verified to implement them correctly).*
- **Resolution & Implemented Safeguards:** Implemented the pre-flight confirmation modal in `ValidateModalScreen.tsx` adhering to Arena design tokens. Cancellation dismisses the modal without network requests. Rapid repeated taps on confirm are guarded by `isSubmittingRef` to prevent duplicate concurrent submissions. If the authoritative backend returns HTTP 402, the error is displayed inline and client balance is updated accordingly.

### API-02: Validation Request Idempotency
- **Category:** Backend Integration & Reliability
- **Status:** Resolved / Implemented (Stage 5 Feature Completion)
- **Evidence:** 
  - Backend implemented durable MongoDB idempotency (`src/modules/idempotency/idempotency.model.ts` and `src/shared/middleware/idempotency.middleware.ts`) bound to `{ userId, idempotencyKey }` with 24-hour TTL.
  - Enforced across all credit-consuming mutation endpoints (`POST /api/idea/submit`, `POST/PUT /api/pitchdeck/:id`, `POST/PUT /api/canvas/:id`, `POST /api/competitors/analyze/:id`, and `POST /api/pitch-simulator/simulate/:id`).
  - Mobile client generates unique operation UUIDs and propagates the `Idempotency-Key` header via [`src/services/api/apiClient.ts`](../src/services/api/apiClient.ts) and [`src/services/api/ideasApi.ts`](../src/services/api/ideasApi.ts).
- **Assessment:** Duplicate requests with the same key safely return cached HTTP responses without duplicate credit deduction; concurrent duplicate calls return HTTP 409 Conflict; failed requests allow clean retry.
- **Required Action:** None. Resolved across mobile and backend.

---

## 2. Authentication & Account Management

### AUTH-01: In-App Account Deletion Capability
- **Category:** App Store Distribution & Compliance
- **Status:** Pending Backend Verification & Store Requirement Audit
- **Requirement:** Apple App Store Review Guideline 5.1.1(v) and Google Play Data Safety policies require apps offering account creation to provide an in-app account deletion flow.
- **Assessment:** Mobile UI is prepared to link account deletion, but the required endpoint (`DELETE /api/auth/account`) is not yet documented as live on the backend.
- **Required Action:** Verify backend deletion endpoint status and store review prerequisites prior to public store binary submission.

### AUTH-02: Hardware Keystore Failure & Native Android Persistence Limitation
- **Category:** Local Data Storage & Session Integrity
- **Status:** Partially Remediated (JavaScript Fail-Closed Hardening Implemented; Native Android Fix Pending Upstream SDK 58 Release)
- **Evidence:**
  - **JavaScript Remediation (Implemented):** [`src/services/storage/tokenStorage.ts`](../src/services/storage/tokenStorage.ts) no longer mirrors native iOS/Android JWTs into `memoryStore` or falls back to JS memory on native `expo-secure-store` failures, instead throwing sanitized [`TokenStorageError`](../src/services/storage/tokenStorage.ts) codes (`GET_FAILED`, `SET_FAILED`, `DELETE_FAILED`). [`src/context/AuthContext.tsx`](../src/context/AuthContext.tsx), [`src/services/api/apiClient.ts`](../src/services/api/apiClient.ts), [`src/navigation/RootNavigator.tsx`](../src/navigation/RootNavigator.tsx), [`src/features/auth/screens/AuthLoadingScreen.tsx`](../src/features/auth/screens/AuthLoadingScreen.tsx), and [`src/features/profile/screens/ProfileScreen.tsx`](../src/features/profile/screens/ProfileScreen.tsx) now enforce fail-closed persistence on sign-in/verification, distinguish storage/network errors from `401` rejections on bootstrap with a recoverable retry flow, keep user-initiated logout errors explicit with retry UI, catch 401 cleanup failures without unhandled rejections, and gate sanitized error diagnostics behind `__DEV__`. *(Note: [`onboardingStorage.ts`](../src/services/storage/onboardingStorage.ts) still retains an in-memory fallback for its non-sensitive onboarding boolean.)*
  - **Remaining Native Limitation:** Installed `expo-secure-store@58.0.3` (and its precompiled `local-maven-repo` Android AAR) still calls `SharedPreferences.Editor.commit()` without checking the `Boolean` result during encrypted writes (`saveEncryptedItem`), and does not roll back Android's in-memory `SharedPreferences` map when a disk commit returns `false`.
- **Assessment:** JavaScript fail-closed handling now prevents silent JS memory fallback, false-success logout on `deleteItemAsync` errors, and premature token deletion on offline/5xx launches. However, on Android `expo-secure-store@58.0.3`, if `commit()` returns `false` (e.g., disk full or unwritable `shared_prefs`), `setItemAsync` still resolves cleanly and same-process `getItemAsync` read-back reads Android's in-memory `SharedPreferences` map rather than disk. Upstream Expo PR `#52131` (fixing `commit()` verification and memory rollback) is merged on Expo `main` but has not yet shipped in an SDK-58-compatible `expo-secure-store` release.
- **Required Action:** Keep the native Android persistence defect tracked as open until an official SDK-58-compatible `expo-secure-store` patch release containing PR `#52131` is published and adopted.

### AUTH-03: Google Sign-In Status
- **Category:** Feature Completeness & Authentication Architecture
- **Status:** Implemented & Unit-Tested (Native Android Credential Manager via `react-native-nitro-google-signin`; Live Device Verification Pending Google Cloud Credentials)
- **Evidence:**
  - [`src/services/auth/googleAuthService.ts`](../src/services/auth/googleAuthService.ts) implements the native Android Credential Manager authentication flow using `react-native-nitro-google-signin` and `react-native-nitro-modules`.
  - [`src/context/AuthContext.tsx`](../src/context/AuthContext.tsx) exposes `signInWithGoogle()`, exchanging Google ID tokens with `POST /api/auth/google`, securely persisting session JWTs via hardware-backed `tokenStorage`, and immediately establishing authenticated sessions without requiring `refreshUser()`.
  - [`src/components/GoogleSignInButton.tsx`](../src/components/GoogleSignInButton.tsx) integrates `signInWithGoogle` with duplicate-tap protection, loading spinners, and graceful user-cancellation handling.
  - Comprehensive unit test suites in [`src/services/auth/__tests__/googleAuthService.test.ts`](../src/services/auth/__tests__/googleAuthService.test.ts), [`src/context/__tests__/AuthContext.google.test.tsx`](../src/context/__tests__/AuthContext.google.test.tsx), and [`src/components/__tests__/GoogleSignInButton.test.tsx`](../src/components/__tests__/GoogleSignInButton.test.tsx).
- **Assessment:** Native Google Sign-In is fully integrated and unit-tested on Android with fail-closed security and Credential Manager fallback chains. Client binaries do not embed private secrets and rely on `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. Real end-to-end device authentication requires developer/project owner registration of the Android OAuth client (package `com.pitchmint.app` and Android signing SHA-1 fingerprint) in the Google Cloud Console.
- **Required Action:** Provide `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` in local `.env.local` and configure corresponding Android and Web OAuth clients in Google Cloud Console for physical/emulator device sign-in.

---

## 3. Store Billing & Monetization

### BILLING-01: Digital Goods In-App Billing vs. Web Checkout
- **Category:** Store Distribution & Compliance
- **Status:** Scheduled for Post-MVP Commercial Release
- **Requirement:** Google Play Billing Policy (Section 3) and Apple App Store Guideline 3.1.1 prohibit third-party web payment checkouts (e.g. Razorpay webviews) for digital credits consumed inside store-distributed binaries.
- **Assessment:** The mobile application intentionally omits Razorpay web checkout to avoid immediate store rejection. For personal testing and internal demos, `config.features.enableDemoTopUp` reuses the development simulation endpoint (`POST /api/credits/simulate-payment-success`), which is strictly blocked in production builds.
- **Required Action:** Conduct a dedicated platform-billing review and integrate native In-App Purchases (Google Play Billing / Apple StoreKit) prior to public commercial store release.

---

## 4. Tooling & Build Dependencies

### Transitive Developer Tooling Advisories (`npm audit`)
- `npm audit --audit-level=high` reports **0 high or critical vulnerabilities**.
- `npm audit` reports 22 moderate-severity dependency graph paths originating from two transitive developer/build-time packages: `glob` (`9.0.0 - 14.0.1`, GHSA-3g3m-2fjr-6pw4, under `jest@30` / `jest-expo`) and `minimatch` (`7.0.0 - 11.0.0`, GHSA-g3hv-75wg-m249, under `@expo/fingerprint` and `glob`).
- **Runtime Assessment:** These packages are dev/test and build-time CLI utilities only. They are not bundled into the Android Hermes bytecode (`assets/index.android.bundle`) or executed on mobile devices.
- **Policy:** Do not run `npm audit fix --force`, as it attempts to downgrade `jest@29.7.0` and `expo@52.0.49`. Upstream patches will be adopted through standard Expo SDK 58 maintenance releases.

### Expo SDK Version Alignment
- **Current Version:** `expo@~58.1.0` (Expo SDK 58).
- **Core Dependencies:** Clean alignment across `react@19.3.0`, `react-native@0.88.1`, `react-native-screens@~4.30.1`, `react-native-safe-area-context@~5.11.1`, and `expo-secure-store@~58.0.3` (`npx expo install --check` and `npx expo-doctor` pass 20/20).
