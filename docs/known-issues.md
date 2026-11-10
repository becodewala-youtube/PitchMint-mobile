# PitchMint Mobile — Known Issues & Technical Debt Register

This document tracks verified limitations, technical debt, release prerequisites, and areas requiring future engineering investigation for `PitchMint-mobile`.

---

## 1. Technical Debt & Codebase Findings

### ENV-01: Tracked `.env` in Version Control
- **Category:** Repository Hygiene & Configuration
- **Status:** Open / Tracked for Future Cleanup
- **Evidence:** `.env` is tracked in Git (`git ls-files .env` returns `.env`); `.gitignore` currently ignores only `.env*.local`.
- **Inspected Content:**
  - `EXPO_PUBLIC_API_URL=https://pitch-mint-backend.vercel.app`
  - `EXPO_PUBLIC_ALLOW_CLEARTEXT=false`
- **Assessment:** No private secrets or credentials are exposed in the current `.env` file. However, tracking `.env` creates a maintenance risk that developer overrides or private values could inadvertently be committed.
- **Required Action:** Untrack `.env` from Git index (`git rm --cached .env`), add `.env` to `.gitignore`, and document standard overrides in `.env.example`.

### API-01: Missing Request Timeout & Cancellation Handling
- **Category:** Network Resilience & UX
- **Status:** Open / Requires Engineering Investigation
- **Evidence:** [`src/services/api/apiClient.ts`](../src/services/api/apiClient.ts) executes native `fetch` without `AbortController` signals or timeout mechanisms.
- **Assessment:** If the backend network socket drops or AI generation hangs indefinitely, the mobile client remains on a loading spinner without timing out or offering clean recovery.
- **Required Action:** Investigate route-specific timeout and cancellation thresholds. Fast profile/auth endpoints may benefit from shorter timeouts (e.g. 10–15s), while heavy AI evaluation, pitch deck, and canvas generations require distinct thresholds and cancel signals.

### UX-01: Inconsistent Credit Consumption Confirmation & Balance Authority
- **Category:** UX Consistency & Accidental Deduction Prevention
- **Status:** Open / Scheduled for UX Hardening
- **Evidence:**
  - `PitchDeckScreen.tsx`: Displays an explicit confirmation modal before deducting 1 credit for regeneration.
  - `CanvasScreen.tsx`: Displays an explicit confirmation modal before deducting 1 credit for generation/regeneration.
  - `IdeaDetailsScreen.tsx`: Displays confirmation modals before generating decks or canvases.
  - `ValidateModalScreen.tsx`: Tapping "Analyze Idea (1 Credit)" executes `POST /api/idea/submit` immediately without an explicit confirmation dialog.
- **Architectural Principles & Assessment:**
  - **Confirmation as UX Safeguard:** Before a credit-consuming user action, the application should present an explicit confirmation showing the operation and its credit cost. Where available, it may display the current credit balance and an estimated post-operation balance. This modal is strictly a client UX safeguard against accidental button presses, not a substitute for server-side authorization.
  - **Non-Guaranteed Client Balance:** Any credit balance displayed in the mobile client may be cached, optimistic, or outdated; it is not guaranteed to represent the server's latest authoritative balance.
  - **Authoritative Backend Responsibility:** The backend server is strictly authoritative for:
    - User authentication and authorization.
    - Idea ownership and permissions.
    - Real-time credit availability verification.
    - Atomic credit deduction.
    - Transaction rollback and refund behavior upon processing failures.
    *(Note: Backend behavior has not been independently audited in this mobile task; refund and rollback mechanisms are documented as server responsibilities without claiming that every current backend route has been verified to implement them correctly).*
- **Required Action:** Add a pre-flight confirmation modal to `ValidateModalScreen.tsx` matching the design and balance feedback of `PitchDeckScreen` and `CanvasScreen`.

### API-02: Validation Request Idempotency
- **Category:** Backend Integration & Reliability
- **Status:** Requires Backend Verification
- **Evidence:** Documented concern from previous project notes regarding whether `POST /api/idea/submit` evaluates idempotency tokens.
- **Assessment:** Mobile currently mitigates network drops by disabling automated retries and guiding users to verify Saved Ideas before resubmitting. Whether the live backend supports or ignores idempotency headers has not been independently verified against backend source code.
- **Required Action:** Coordinate with backend team to verify if `Idempotency-Key` header handling is supported or needed before high-volume commercial launch.

---

## 2. Authentication & Account Management

### AUTH-01: In-App Account Deletion Capability
- **Category:** App Store Distribution & Compliance
- **Status:** Pending Backend Verification & Store Requirement Audit
- **Requirement:** Apple App Store Review Guideline 5.1.1(v) and Google Play Data Safety policies require apps offering account creation to provide an in-app account deletion flow.
- **Assessment:** Mobile UI is prepared to link account deletion, but the required endpoint (`DELETE /api/auth/account`) is not yet documented as live on the backend.
- **Required Action:** Verify backend deletion endpoint status and store review prerequisites prior to public store binary submission.

### AUTH-02: Hardware Keystore Fallback Behavior
- **Category:** Local Data Storage
- **Status:** Requires Investigation
- **Evidence:** [`src/services/storage/tokenStorage.ts`](../src/services/storage/tokenStorage.ts) and [`onboardingStorage.ts`](../src/services/storage/onboardingStorage.ts) catch exceptions from `expo-secure-store` and fallback to an in-memory dictionary.
- **Assessment:** In testing environments (Node.js/Jest), the memory store is essential. In production native builds, a persistent keystore failure leaves the session in volatile memory for the duration of the app run.
- **Required Action:** Investigate production keystore failure scenarios to ensure production builds handle hardware lockouts safely without unintended fallback retention.

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
- **Current Version:** `expo@~58.0.23` (Expo SDK 58).
- **Core Dependencies:** Clean alignment across `react@19.3.0`, `react-native@0.88.1`, `react-native-screens@~4.30.1`, and `react-native-safe-area-context@~5.11.1`.
