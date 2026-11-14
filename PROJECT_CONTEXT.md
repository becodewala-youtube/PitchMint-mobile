# PitchMint Mobile — Verified Project Context

This document captures the verified technical facts, architecture, dependencies, and operational conventions for `PitchMint-mobile`.

---

## 1. Verified Technology Stack

| Component | Specified Version | Lockfile Version | Notes |
| :--- | :--- | :--- | :--- |
| **Expo SDK** | `~58.0.25` | `58.0.25` | Continuous Native Generation (CNG), EAS ready |
| **React Native** | `0.88.1` | `0.88.1` | Native runtime |
| **React** | `19.3.0` | `19.3.0` | Core UI library |
| **TypeScript** | `~6.0.3` | `6.0.3` | Strict mode enabled (`noEmit: true`) |
| **Navigation** | `^7.5.0` / `^7.20.0` | `7.5.0` / `7.20.0` | React Navigation 7 (`@react-navigation/native`, `native-stack`, `bottom-tabs`) |
| **Hardware Storage** | `~58.0.3` | `58.0.3` | `expo-secure-store` (Keychain / Keystore) |
| **Native Primitives** | `~4.30.1` / `~5.11.1` | `4.30.1` / `5.11.1` | `react-native-screens`, `react-native-safe-area-context` |
| **System Integrations**| `~58.0.5` / `~58.0.4` | `58.0.5` / `58.0.4` | `expo-status-bar`, `expo-clipboard` |
| **Testing** | `~30.5.2` / `~58.0.14` | `30.5.2` / `58.0.14` | `jest`, `jest-expo`, `@testing-library/react-native` (`^14.1.0`) |

---

## 2. High-Level Architecture Summary

`PitchMint-mobile` is an independent, feature-first React Native mobile client. Detailed architectural specifications are maintained authoritatively in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

- **Navigation Model:** Built with React Navigation 7 (`RootNavigator`) managing session bootstrap (`AuthLoadingScreen`), first-run onboarding (`WelcomeScreen`, `OnboardingScreen`), native auth stack (`AuthNavigator`), and an authenticated tab shell (`BottomTabNavigator`). A center 54dp squircle action button intercepts tab presses to present `ValidateModalScreen` as a modal overlay. Detail views (`IdeaDetails`, `PitchDeck`, `Canvas`) open via native slide transitions. *(Details: [`docs/ARCHITECTURE.md#3-navigation-architecture`](docs/ARCHITECTURE.md#3-navigation-architecture))*.
- **State & Session Persistence:** Pure React Context (`AuthContext`, `OnboardingContext`) with zero external state libraries. Access tokens (`pitchmint_auth_token`) and onboarding status are persisted in device hardware via `expo-secure-store` with an in-memory fallback for test runners. *(Details: [`docs/ARCHITECTURE.md#5-state-management--api-integration`](docs/ARCHITECTURE.md#5-state-management--api-integration))*.
- **HTTP & Backend Contract:** Centralized `apiClient.ts` wrapper with Bearer token injection, `X-Request-ID` tracing, and global 401 interception. Communicates with external backend services across authentication (`authApi`), startup evaluation and generation (`ideasApi`), balance management (`creditsApi`), and audit logging (`activityApi`). Base URL resolved via `env.ts`. *(Details: [`docs/ARCHITECTURE.md#5-state-management--api-integration`](docs/ARCHITECTURE.md#5-state-management--api-integration))*.
- **Credit Operations & Balance Authority:** Pre-flight credit confirmation modals are client UX safeguards to prevent accidental clicks. Displayed mobile balances may be cached or outdated and are **not guaranteed**. The backend server is strictly authoritative for balance verification, resource ownership, atomic deduction, and rollback/refund behavior upon processing failure. *(Details: [`docs/ARCHITECTURE.md#6-credit-operations--balance-authority`](docs/ARCHITECTURE.md#6-credit-operations--balance-authority))*.
- **Design System:** Strict dark-only Arena design system (`#000000` canvas, `#0A0A0A` cards, `#7C3AED` brand violet, 48dp minimum touch targets, 54dp CTA). Powered by 13 reusable primitives in `src/components/` and design tokens in `src/theme/`. *(Details: [`docs/ARCHITECTURE.md#4-design-system-tokens-arena-design-fidelity`](docs/ARCHITECTURE.md#4-design-system-tokens-arena-design-fidelity))*.
- **Security & Privacy Mandates:** Zero client-side private secrets; only public `EXPO_PUBLIC_*` values may be bundled. Cleartext HTTP is disabled in production builds via `plugins/withCleartextTraffic.js`. Sensitive auth data is never logged. *(Details: [`docs/ARCHITECTURE.md#7-security--mobile-architectural-controls`](docs/ARCHITECTURE.md#7-security--mobile-architectural-controls))*.

---

## 3. Application Readiness Terminology & Feature Inventory

### Terminology Definitions
- **Implemented:** Feature code exists in the application.
- **Unit-tested:** Relevant automated unit/component tests exist and pass.
- **Integration-verified:** Communication with the live backend contract has been verified.
- **Device-verified:** Tested on actual physical or emulated devices.
- **Release-ready:** Full functional, security, operational, and store distribution requirements have been validated.

### Feature Readiness Matrix

| Feature Module | Implementation Status | Test Coverage | Readiness Classification | Notes & Gaps |
| :--- | :--- | :--- | :--- | :--- |
| **Email Auth Flow** | Implemented | Unit-tested (Jest) | Unit-tested | Live registration, verification, sign-in, reset. Backend lacks account deletion. |
| **Google Auth Flow** | Implemented (Stub) | Unit-tested (Jest) | Implemented | Informational dialog placeholder only per Stage 1 audit. Requires evaluating supported Expo SDK 58 approaches (browser-based vs. native SDK) and backend contract. |
| **Idea Validation** | Implemented | Unit-tested (Jest) | Unit-tested | 5-step heuristic screen with 1-credit pre-flight confirmation modal. UI balance is not guaranteed; backend is authoritative for deduction and refunds. |
| **Saved Ideas Catalog**| Implemented | Unit-tested (Jest) | Unit-tested | Paginated fetching with client-side filter chips. |
| **Idea Details** | Implemented | Unit-tested (Jest) | Unit-tested | Multi-score rings, breakdown bars, accordion explanations. |
| **Pitch Deck Viewer** | Implemented | Unit-tested (Jest) | Unit-tested | 10 slides, progress tracker, 1-credit confirmation modal. PDF export deferred. |
| **Business Canvas** | Implemented | Unit-tested (Jest) | Unit-tested | 9 blocks, Markdown export via Clipboard, 1-credit confirmation modal. |
| **Activity Feed** | Implemented | Unit-tested (Jest) | Unit-tested | Chronological log of evaluations and credit events. |
| **Demo Credit Top-Up** | Implemented | Unit-tested (Jest) | Unit-tested | Development-only top-up. Production store billing not implemented. |

---

## 4. Verification & CI Configuration

- **TypeScript Verification:** `npm run typecheck` (`tsc --noEmit`)
- **Automated Tests:** `npm test` (`jest`)
- **Expo Diagnostics:** `npm run doctor` (`npx expo-doctor`)
- **Bundle Export Verification:** `npm run export:android` (`npx expo export --platform android`)
- **CI Pipeline (`.github/workflows/ci.yml`):**
  - Runner: `ubuntu-latest`
  - Node.js runtime: `22` (cached npm dependencies)
  - Triggered on push to `main` and pull requests targeting `main`.
- **Test Snapshot (Dated Audit Snapshot: November 2026):**
  - 36 test suites, 320 tests passing cleanly (0 failures).
  - Baseline at Stage 4.4 was 32 suites, 270 tests; +12 tests added in Stage 5.1; +38 tests and 4 test suites added in Stage 5.1.1 remediating review findings (+9 in `apiClient.lifecycle.test.ts`, +6 in `usePitchDeck.recovery.test.tsx`, +6 in `useCanvas.recovery.test.tsx`, +8 in `useIdeaDetails.recovery.test.tsx`, +2 in `ideasApi.test.ts`, +1 in `apiClient.test.ts`, +1 in `PitchDeckScreen.test.tsx`, +1 in `CanvasScreen.generation.test.tsx`, +1 in `IdeaDetailsScreen.modules.test.tsx`, +4 in existing suites).
  - 100% adherence to strict architectural rule: zero production source or test files exceed 500 lines.
  *(Note: Dynamic test numbers will change over time as new tests are added).*

---

## 5. Tracked Technical Debt & Open Findings Summary

The following items are tracked in [`docs/known-issues.md`](docs/known-issues.md):
1. **ENV-01:** Resolved as a verified safe public-default convention. Tracked `.env` provides safe defaults (`EXPO_PUBLIC_*`); local overrides belong in ignored `.env.local`. No untracking or history rewrite is required.
2. **API-01:** Resolved. `apiClient.ts` implements configurable request timeouts (`DEFAULT_TIMEOUT_MS = 15000` standard default, `AI_GENERATION_TIMEOUT_MS = 60000` explicit configuration for the five credit-consuming operations in `ideasApi.ts`), caller overrides, response stream timeout protection, and caller `AbortSignal` API-level cancellation capability. Distinct `TIMEOUT` and `CANCELLED` error codes prevent misclassifying timeouts as auth or payment failures. Credit-consuming endpoints enforce non-retry policies and prompt the user to check saved ideas / idea status before attempting repeated requests. Status verification uses conservative content comparison fallback due to absence of backend timestamp/version markers.
3. **UX-01:** Resolved. `ValidateModalScreen.tsx` includes pre-flight 1-credit confirmation modal matching Pitch Deck and Canvas patterns with duplicate-tap protection. Backend remains authoritative for credit checks, atomic deduction, and rollback/refund behavior.
4. **API-02:** Backend idempotency handling on `POST /api/idea/submit` (as well as `POST/PUT /api/pitchdeck/:id` and `POST/PUT /api/canvas/:id`) remains OPEN. Client-side timeouts and aborts do NOT guarantee backend transaction rollback or cancel server-side AI processing; backend idempotency verification remains a separate tracked issue.
5. **AUTH-01:** In-app account deletion (`DELETE /api/auth/account`) required for App Store and Google Play compliance.
6. **AUTH-02:** JavaScript fail-closed hardening is implemented, but the Android SecureStore native persistence limitation (`SharedPreferences.Editor.commit()` Boolean result check and memory rollback in `expo-secure-store@58.0.3`) remains open pending upstream SDK release.
7. **AUTH-03:** Google Sign-In is an informational placeholder stub. Implementation requires evaluating supported Expo SDK 58 authentication approaches (browser-based vs. native SDK) and backend integration.
8. **BILLING-01:** Production in-app billing (Google Play Billing / Apple StoreKit) required for public store release.

---

## 6. Detailed Documentation Index

For deep architectural, operational, and SDLC specifications, consult:
- **Comprehensive System Architecture:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- **Technical Debt & Known Issues Register:** [`docs/known-issues.md`](docs/known-issues.md)
- **Local Setup & Developer Guide:** [`docs/SETUP.md`](docs/SETUP.md)
- **SDLC & CI/CD Tooling Guide:** [`docs/development-workflow.md`](docs/development-workflow.md)
- **Agent Rules Directory:** [`.agents/rules/`](.agents/rules/)
  - Project Scope & Boundaries: [`.agents/rules/project.md`](.agents/rules/project.md)
  - Codebase Architecture Guidelines: [`.agents/rules/architecture.md`](.agents/rules/architecture.md)
  - Coding Conventions: [`.agents/rules/coding.md`](.agents/rules/coding.md)
  - Engineering Lifecycle & Review Model: [`.agents/rules/workflow.md`](.agents/rules/workflow.md)
