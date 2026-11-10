# PitchMint Mobile — Project Specification & Repository Boundaries

## 1. Product Purpose & Architecture
**PitchMint Mobile** is an AI-assisted startup evaluation and pitch validation companion app for founders. It provides a native mobile experience based on the PitchMint Arena prototype (`https://01a12dcd-2c11-7ac0-9fe0-162a7be0ac4b.arena.site/`).

### Primary Feature Capabilities
- **Home Dashboard (`HomeScreen`):** Displays MongoDB credit balance summary (cached/optimistic), account tier, quick actions, and recent saved ideas.
- **Ideas Catalog (`IdeasScreen`):** Searchable list of saved startup evaluations with filter chips (Top scored, Has deck, Not explored).
- **Idea Deep-Dive (`IdeaDetailsScreen`):** Comprehensive validation score rings, category breakdown bars, and AI explanation accordions.
- **Idea Validation (`ValidateModalScreen`):** Interactive modal evaluating startup ideas across 5 analysis steps (costs 1 credit).
- **Pitch Deck (`PitchDeckScreen`):** 10-slide native investor deck viewer with slide counter, progress bar, and 1-credit regeneration flow.
- **Business Model Canvas (`CanvasScreen`):** 9-block Lean Business Model Canvas viewer with Markdown clipboard export and 1-credit generation flow.
- **Activity Feed (`ActivityScreen`):** Chronological audit log of idea evaluation runs and credit events.
- **Profile & Settings (`ProfileScreen`):** User identity, tier badge, security toggles, and development-only demo credit top-up controls.
- **Onboarding (`WelcomeScreen`, `OnboardingScreen`):** Value proposition walkthrough with completion flag persisted via `expo-secure-store`.
- **Authentication:** Session management supporting email/password and Google OAuth stub, hardware-backed token storage, 401 automatic session invalidation, and unverified email redirection.

---

## 2. Independent Repository Boundaries
PitchMint consists of three strictly decoupled repositories:
1. **`PitchMint-mobile` (this repository):** Independent React Native / Expo application.
2. **`PitchMint-Backend`:** Independent Node.js / Express / MongoDB / Gemini server.
3. **`PitchMint-frontend`:** Independent Next.js / TailwindCSS web application.
4. **`design-mobile-app-from-website`:** Read-only design reference.

### Strict Boundary Rules
- **NEVER** convert the three repositories into a monorepo, symlinked packages, or shared workspaces.
- **NEVER** edit files in `PitchMint-Backend`, `PitchMint-frontend`, or `design-mobile-app-from-website` while working on mobile tasks.
- Treat backend APIs strictly as external HTTP contracts.
- Changes in `PitchMint-mobile` must never depend on unreleased backend changes.

---

## 3. Verified Technology Stack
- **Framework:** Expo SDK 58 (`~58.0.23`, Continuous Native Generation / CNG, EAS Build ready)
- **Runtime:** React Native 0.88.1, React 19.3.0
- **Language:** TypeScript `~6.0.3` (Strict mode, `noEmit: true`)
- **Navigation:** React Navigation 7 (`@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`). Do NOT use Expo Router.
- **Persistence:** Hardware-backed `expo-secure-store` (iOS Keychain / Android Keystore EncryptedSharedPreferences) with in-memory fallback for test environments.
- **Testing:** Jest 30.5.2, `jest-expo` 58.0.14, `@testing-library/react-native` 14.1.0, `react-test-renderer` 19.3.0.
- **Quality & Diagnostics:** `tsc --noEmit`, `npx expo-doctor`, Android bundle export checks.

---

## 4. Design System (Arena Dark-Only)
- **Theme:** Strict Dark Theme only (no light mode).
- **Background Palette:**
  - Base canvas: `#000000`
  - Elevated card surfaces: Card `#0A0A0A`, Input/Surface `#141414`, Modal/Elevated `#1A1A1A`
- **Brand Colors:**
  - Brand violet: `#7C3AED`
  - Soft violet text / active state: `#A78BFA`
  - Signature 3D button: `#5E17EB` with `#3904A6` 4px bottom press edge
- **Touch Targets:** Minimum 48dp on all interactive elements (`touchTargets.minTouchSize = 48`); center action button is 54dp (`touchTargets.fabSize = 54`).

---

## 5. Backend Integration & Configuration
- **API Client:** `src/services/api/apiClient.ts` uses native `fetch` with token injection, request UUID tracing, and 401 interceptors.
- **Environment Configuration:** `src/config/env.ts` reads `EXPO_PUBLIC_API_URL` with fallback to `https://pitch-mint-backend.vercel.app`. Adapts `localhost` to `10.0.2.2` on Android native emulators.
- **Credit Operations & Server Authority:** Client credit confirmations are UX safeguards against accidental taps. Displayed balances are not guaranteed. The backend is strictly authoritative for balance verification, resource ownership, atomic deduction, and rollback/refund handling upon failure.
- **Zero-Secret Guarantee:** Client binaries are publicly distributed. Server credentials (JWT secret, Gemini API key, Razorpay secrets, database connection strings) are **strictly forbidden** in mobile client code or configurations.

---

## 6. Human Approval & Governance
- **Never Merge Autonomously:** The project owner must review all diffs and approve pull requests before merging into `main`.
- **Never Deploy or Publish Autonomously:** EAS cloud builds, app store submissions, and releases require explicit human authorization.
- **Safety Over Speed:** If an action's impact is ambiguous, stop and request clarification.
