# PitchMint Mobile — Architecture & Implementation Constraints

This document governs architectural boundaries, component reuse, and implementation constraints for engineers and AI agents working on `PitchMint-mobile`. For comprehensive system diagrams and deep-dive specifications, consult [`docs/ARCHITECTURE.md`](../../docs/ARCHITECTURE.md).

---

## 1. Feature-First Architecture & Code Organization
- **Feature-First Layout:** All application features reside under `src/features/<feature-name>/` (e.g. `auth`, `home`, `ideas`, `pitch-deck`, `canvas`, `validate`, `activity`, `profile`, `onboarding`).
- **Standardized Feature Substructure:** Features with non-trivial presentation, business logic, or static data must follow the standardized nested directory structure:
  - `components/` — localized subcomponents used by the feature.
  - `constants/` — authoritative domain definitions, option lists, and static data.
  - `hooks/` — specialized custom hooks encapsulating screen state, data fetching, mutations, and confirmation flows.
  - `screens/` — focused screen composition files (under 300 lines) with co-located `.styles.ts` files.
  - `utils/` — feature-specific text formatters and serializers.
  - `__tests__/` or `screens/__tests__/` — focused Jest unit test suites split by functional concern.
- **Hard File Size Limits:**
  - **No production source or test file may exceed 500 lines.** The ideal target is 200–400 lines per file.
  - Oversized screens (> 500 lines) must be decomposed into co-located components, custom hooks, and separated `.styles.ts` files.
  - Test suites exceeding 400 lines must be split into concern-focused files (e.g. `.test.tsx`, `.generation.test.tsx`, `.submission.test.tsx`, `.modules.test.tsx`) with shared fixtures in `*Fixtures.ts`.
- **No Speculative Layers:** Do not introduce additional architectural layers, service locator patterns, or state libraries (e.g. Redux, Zustand, MobX, React Query). Rely on existing React Context and modular service utilities.
- **Clean Separation:** Pure presentation components reside in `src/components/`, design tokens in `src/theme/`, shared navigation in `src/navigation/`, and API/storage clients in `src/services/` and `src/api/`.

---

## 2. Component Composition & UI Primitives
- **Reuse Existing Primitives:** Always reuse `src/components/` primitives (`Button`, `Card`, `AuthCard`, `Input`, `ScreenContainer`, `Badge`, `Pill`, `ScoreRing`, `ScoreBar`, `IconBadge`, `SectionHeader`, `Icon`, `IdeaCard`, `CreditConfirmationModal`) before creating new UI controls.
- **Authoritative Shared Definitions:**
  - **Pitch Deck Structure:** `SLIDE_DEFINITIONS` in `src/features/pitch-deck/constants/slideDefinitions.ts` is the single source of truth for all 10 investor deck slides.
  - **Lean Canvas Structure:** `CANVAS_BLOCK_DEFINITIONS` in `src/features/canvas/constants/blockDefinitions.ts` is the single source of truth for all 9 business model canvas blocks.
  - **Icon Modularization:** `src/components/Icon.tsx` delegates to categorized icon sets in `src/components/icons/` (`navigationIcons`, `actionIcons`, `statusIcons`, `mediaIcons`).
  - **Startup Idea Card:** `src/components/IdeaCard.tsx` is the authoritative shared component for rendering ideas across Home, Saved Ideas catalog, and preview feeds.
  - **Credit Confirmation Modal:** `src/components/CreditConfirmationModal.tsx` is the shared presentation component for all pre-flight credit deduction confirmations across Validation, Pitch Deck, Canvas, and Idea Details.
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
- **Zero Backend Logic Duplication:** Do not duplicate server-side validation or business logic on the client. Consume endpoints via dedicated services: `authApi`, `ideasApi`, `creditsApi`, and `activityApi`. Re-exported conveniently via `src/api/index.ts`.
- **Credit Confirmation & Server Authority:**
  - Client confirmation modals (e.g. before validation, deck generation, or canvas generation) are **client UX safeguards** to prevent accidental clicks; they do not replace server-side checks.
  - Any credit balance displayed in the mobile client may be cached or outdated and is **not guaranteed**.
  - The backend server is strictly authoritative for authentication, resource ownership, credit availability verification, atomic deduction, and rollback/refund handling upon failure.

---

## 6. Runtime Configuration & Security Mandates
- **Sanitized Environment Variables:** Read environment values exclusively via `src/config/env.ts`, which enforces trailing slash removal and Android emulator loopback routing (`10.0.2.2`).
- **Zero Private Secrets:** Client binaries are publicly distributed. Server secrets (`JWT_SECRET`, `GEMINI_API_KEY`, `RAZORPAY_KEY_SECRET`, database URIs) are strictly forbidden in client code. Only `EXPO_PUBLIC_*` variables may be bundled.
- **Privacy & Logging:** Never log passwords, tokens, verification codes, or sensitive payloads. Sanitize error objects prior to logging.
