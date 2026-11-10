# PitchMint Mobile — Architecture & Implementation Constraints

This document governs architectural boundaries, component reuse, and implementation constraints for engineers and AI agents working on `PitchMint-mobile`. For comprehensive system diagrams and deep-dive specifications, consult [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md).

---

## 1. Feature-First Architecture & Code Organization
- **Feature-First Layout:** All application features reside under `src/features/<feature-name>/` (e.g. `auth`, `home`, `ideas`, `pitch-deck`, `canvas`, `validate`, `activity`, `profile`, `onboarding`). Screens, localized components, hooks, and tests must remain co-located.
- **No Speculative Layers:** Do not introduce additional architectural layers, service locator patterns, or state libraries (e.g. Redux, Zustand, MobX, React Query). Rely on existing React Context and modular service utilities.
- **Clean Separation:** Pure presentation components reside in `src/components/`, design tokens in `src/theme/`, shared navigation in `src/navigation/`, and API/storage clients in `src/services/`.

---

## 2. Component Composition & UI Primitives
- **Reuse Existing Primitives:** Always reuse `src/components/` primitives (`Button`, `Card`, `AuthCard`, `Input`, `ScreenContainer`, `Badge`, `Pill`, `ScoreRing`, `ScoreBar`, `IconBadge`, `SectionHeader`, `Icon`) before creating new UI controls.
- **Design Tokens:** Strictly adhere to the Arena dark-only design system tokens in `src/theme/` (`colors.ts`, `spacing.ts`, `typography.ts`). Never hardcode ad-hoc hex values.
- **Touch Targets:** Maintain the **minimum 48x48dp** interactive size requirement (`touchTargets.minTouchSize = 48`) on all touchable elements. Floating action buttons and the center CTA must meet 54dp (`touchTargets.fabSize = 54`).

---

## 3. Navigation & Presentation Patterns
- **React Navigation 7 Exclusivity:** Navigation is built strictly with React Navigation 7 native stacks and bottom tabs. Expo Router is not used.
- **Routing Hierarchy:**
  - `RootNavigator` (`src/navigation/RootNavigator.tsx`) evaluates `useAuth()` and `useOnboarding()` to route between `AuthLoading`, `Welcome`, `Onboarding`, `Auth`, and `MainTabs`.
  - Center tab action button intercepts tab switching to launch `ValidateModalScreen` as a modal overlay (`presentation: 'modal'`).
  - Feature deep-dives (`IdeaDetails`, `PitchDeck`, `Canvas`) mount on the root native stack with slide transitions (`slide_from_right`).
- **Route Types:** All route parameters must be strongly typed in `src/navigation/types.ts` (`RootStackParamList`, `MainTabParamList`, `AuthStackParamList`).

---

## 4. State Management & Persistent Storage
- **Context-Driven State:** Pure React Context (`AuthContext`, `OnboardingContext`) manages session lifecycle without external stores.
- **Hardware-Backed Credential Storage:** Store session JWTs exclusively in `expo-secure-store` via `src/services/storage/tokenStorage.ts` under key `pitchmint_auth_token`. Maintain the in-memory fallback for test runners. Plaintext token storage is strictly forbidden.
- **Google Authentication Architecture:** Native Google authentication is not currently implemented; `src/services/auth/googleAuthService.ts` is an informational placeholder stub per the Stage 1 audit. Before implementing Google Sign-In, engineering must investigate supported authentication approaches for Expo SDK 58 (browser-based OAuth vs. native SDK) and the backend contract before selecting a library or build modality.

---

## 5. API Integration & Backend Authority
- **Centralized Client:** Channel all HTTP requests through `src/services/api/apiClient.ts` to ensure automatic JSON parsing, Bearer token injection, `X-Request-ID` UUID tracing, and 401 Unauthorized handling.
- **Zero Backend Logic Duplication:** Do not duplicate server-side validation or business logic on the client. Consume endpoints via dedicated services: `authApi`, `ideasApi`, `creditsApi`, and `activityApi`.
- **Credit Confirmation & Server Authority:**
  - Client confirmation modals (e.g. before validation, deck generation, or canvas generation) are **client UX safeguards** to prevent accidental clicks; they do not replace server-side checks.
  - Any credit balance displayed in the mobile client may be cached or outdated and is **not guaranteed**.
  - The backend server is strictly authoritative for authentication, resource ownership, credit availability verification, atomic deduction, and rollback/refund handling upon failure.

---

## 6. Runtime Configuration & Security Mandates
- **Sanitized Environment Variables:** Read environment values exclusively via `src/config/env.ts`, which enforces trailing slash removal and Android emulator loopback routing (`10.0.2.2`).
- **Zero Private Secrets:** Client binaries are publicly distributed. Server secrets (`JWT_SECRET`, `GEMINI_API_KEY`, `RAZORPAY_KEY_SECRET`, database URIs) are strictly forbidden in client code. Only `EXPO_PUBLIC_*` variables may be bundled.
- **Privacy & Logging:** Never log passwords, tokens, verification codes, or sensitive payloads. Sanitize error objects prior to logging.
