# PitchMint Mobile — Known Issues & Technical Debt Register

This document tracks verified limitations, technical debt, release prerequisites, and areas requiring future engineering investigation for `PitchMint-mobile`.

---

## 1. Technical Debt & Codebase Findings

### ENV-01: Tracked `.env` in Version Control
- **Category:** Repository Hygiene & Configuration
- **Status:** Resolved / Verified Safe Public Default Convention
- **Evidence:**
  - `.env` is tracked in Git (`git ls-files .env` returns `.env`) to provide verified default endpoint configuration for local execution and preview builds.
  - `.gitignore` ignores developer overrides via `.env*.local`.
  - [`.env.example`](../.env.example) documents standard override options, local emulator endpoints, and feature flags.
  - Historical Git audit (Stage 3.1) of all four historical revisions of `.env` (`2eb9387`, `fbe9bc7`, `21f4d18`, `a2b5b98`) confirmed that only `EXPO_PUBLIC_*` variables were ever committed.
- **Inspected Content:**
  - `EXPO_PUBLIC_API_URL=https://pitch-mint-backend.vercel.app`
  - `EXPO_PUBLIC_ALLOW_CLEARTEXT=false`
- **Assessment & Policy Correction:**
  - **Public Configuration vs. Private Secrets:** Variables prefixed with `EXPO_PUBLIC_` are embedded directly into client application bundles (JavaScript and Hermes bytecode) by Expo/Metro. These public URLs and client flags are not private server secrets.
  - **Local Overrides in `.env.local`:** Machine-specific development overrides (e.g., custom LAN IPs, emulator URLs, or local testing flags) belong in `.env.local` (or `.env.*.local`), which are explicitly ignored by `.gitignore`.
  - **Strict Secret Prohibition:** Private credentials (such as `JWT_SECRET`, database connection strings, or payment provider secret keys) must never be placed in `.env` or committed to version control.
  - **No Credential Rotation or History Rewrite Required:** Based on the completed Stage 3.1 security audit of all four historical `.env` versions, no private credentials or secrets were ever committed to Git history. Therefore, no credential rotation, history scrubbing, or BFG/filter-repo rewrite is required.
  - **Deliberate Repository Convention:** The earlier recommendation to untrack `.env` solely because it is tracked in Git was outdated. Keeping `.env` tracked with safe public defaults is a deliberate repository convention that ensures seamless developer onboarding and predictable CI/preview builds. It is not an active credential incident or security vulnerability.
- **Required Action:** None. Maintain `.env` tracked with safe public defaults, preserve `.env*.local` in `.gitignore` for machine-specific overrides, and ensure private secrets are never introduced.

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
- **Status:** Open / Requires Backend Verification
- **Evidence:** Documented concern regarding whether `POST /api/idea/submit` (as well as `POST/PUT /api/pitchdeck/:id` and `POST/PUT /api/canvas/:id`) evaluates idempotency tokens.
- **Assessment:** While Stage 5.1 introduced client-side request timeout handling and non-retry safety policies in the mobile client, client timeouts do NOT guarantee that backend AI processing was cancelled or that atomic credit deductions were rolled back. Backend idempotency handling remains a separate open concern.
- **Required Action:** Coordinate with backend team to verify if `Idempotency-Key` header handling or atomic transaction rollback is supported or needed before high-volume commercial launch.

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
- **Status:** Implemented as Placeholder Stub (Investigation Pending)
- **Evidence:** [`src/services/auth/googleAuthService.ts`](../src/services/auth/googleAuthService.ts) presents an informational dialog directing users to email/password authentication.
- **Assessment:** Native Google authentication is not currently implemented; the existing flow is an informational placeholder stub per the Stage 1 audit. Before implementation, engineering must investigate supported authentication approaches for the active Expo SDK (SDK 58) and backend contract. Evaluation must consider browser-based OAuth (e.g. `expo-auth-session`) and native SDK integration where applicable. A native SDK approach may require a custom development build (`expo-dev-client` / EAS Build). The implementation should be selected only after evaluating compatibility, security, user experience, and backend integration.
- **Required Action:** Evaluate supported Expo SDK 58 authentication options and backend integration requirements before selecting a library or build strategy.

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
- `npm audit` reports moderate/high advisories on build-time developer packages (`node-forge`, `uuid`, `zod`) pulled in transitively by `@expo/cli` and build tools.
- **Runtime Assessment:** These packages are build-time CLI utilities only. They are not bundled into the Android Hermes `.hbc` binary or distributed to mobile devices.
- **Policy:** Do not run `npm audit fix --force` as it attempts to downgrade Expo to an incompatible historical release. Upstream updates will be incorporated through standard Expo SDK maintenance releases.

### Expo SDK Version Alignment
- **Current Version:** `expo@~58.0.25` (Expo SDK 58).
- **Core Dependencies:** Clean alignment across `react@19.3.0`, `react-native@0.88.1`, `react-native-screens@~4.30.1`, and `react-native-safe-area-context@~5.11.1`.
