# PitchMint Mobile — Verified Project Context

This document captures the verified facts, versions, scripts, and status of `PitchMint-mobile` as of October 2026.

---

## 1. Stack & Dependency Versions
- **Expo SDK:** `~57.0.31`
- **React Native:** `0.86.3`
- **React:** `19.2.3`
- **TypeScript:** `~6.0.3` (Strict mode)
- **React Navigation:**
  - `@react-navigation/native`: `^7.5.0`
  - `@react-navigation/native-stack`: `^7.20.0`
  - `@react-navigation/bottom-tabs`: `^7.20.0`
- **Native Primitives:**
  - `react-native-screens`: `~4.26.0`
  - `react-native-safe-area-context`: `~5.7.0`
  - `expo-secure-store`: `~57.0.4`
  - `expo-status-bar`: `~57.0.1`
- **Testing:**
  - `jest`: `^29.7.0`
  - `jest-expo`: `^57.0.6`
  - `@testing-library/react-native`: `^14.1.0`

---

## 2. Repository Structure
```
PitchMint-mobile/
├── .agents/rules/           # SDLC, architecture, coding, and project rules
├── .github/
│   ├── workflows/
│   │   ├── ci.yml           # Automated CI verification workflow
│   │   └── graphify-update.yml # Auto-updates knowledge graph when PR merges to main
│   └── dependabot.yml       # Dependency update schedule and group policy
├── assets/                  # Launcher icon, splash screen, adaptive icons
├── docs/                    # Architecture, known issues, and workflow docs
├── graphify-out/            # Generated knowledge graph (graph.json, GRAPH_REPORT.md, graph.html)
├── src/
│   ├── app/                 # App root component and AppProviders
│   ├── navigation/          # React Navigation stacks, tabs, and types
│   ├── context/             # AuthContext and OnboardingContext
│   ├── features/            # Feature screens (home, ideas, validate, activity, profile, auth, onboarding)
│   ├── components/          # Reusable dark Arena presentation components
│   ├── theme/               # Dark theme tokens (colors, spacing, typography)
│   ├── services/            # API client, auth API, token/onboarding storage
│   ├── config/              # env.ts with safe EXPO_PUBLIC_* resolution
│   └── utils/               # Form and string validators
├── app.json                 # Expo application manifest
├── index.ts                 # Application root entrypoint
├── package.json             # Scripts and dependencies
└── tsconfig.json            # TypeScript configuration
```

---

## 3. Available npm Scripts
- `npm run start`: Launch the Expo development server.
- `npm run android`: Start Expo with Android target.
- `npm run ios`: Start Expo with iOS target.
- `npm run web`: Start Expo web preview.
- `npm run typecheck`: Run TypeScript compiler (`tsc --noEmit`).
- `npm run doctor`: Run `npx expo-doctor` diagnostic checks.
- `npm test`: Run Jest unit and component test suites.
- `npm run export:android`: Run `npx expo export --platform android` bundle verification.
- `npm run graphify:update`: Run AST extraction, clustering, and HTML graph export.
- `npm run graphify:extract`: Run code-only AST extraction to `graphify-out/graph.json`.
- `npm run graphify:html`: Generate standalone interactive `graphify-out/graph.html`.

---

## 4. API & Environment Conventions
- **Base URL:** Defined via `EXPO_PUBLIC_API_URL` in `.env` (fallback: `http://localhost:4000`).
- **HTTP Client:** `src/services/api/apiClient.ts` handles:
  - 15-second default request timeouts.
  - Automatic injection of `Authorization: Bearer <token>`.
  - Global 401 interception callback that resets session state cleanly.
- **Security Rule:** Zero server credentials in mobile code.

---

## 5. Authentication & Onboarding Behavior
- **Hardware-Backed Session:** Access tokens are stored in `expo-secure-store` via `tokenStorage.ts`. In test environments or when keystore is unavailable, it falls back to an in-memory map.
- **Onboarding Gate:** `OnboardingContext` checks `pitchmint_onboarding_completed` flag before allowing navigation to `AuthNavigator`.
- **Session Hydration:** `RootNavigator` mounts `AuthLoadingScreen` while checking credentials, preventing flash of unauthenticated screens.
- **Email Verification Redirection:** When backend returns 401 with `emailNotVerified: true`, app directs to `EmailVerificationScreen` with email pre-populated.

---

## 6. Current Testing & CI Status
- **Test Suites:** 21 passed, 21 total.
- **Tests:** 146 passed, 146 total.
- **TypeScript:** Clean pass (`tsc --noEmit` exits 0).
- **Android JS Export:** Passes (`npx expo export --platform android` bundles 890 modules into Hermes bytecode in ~8.6s).
- **Expo Doctor:** 21/21 checks passed cleanly on Expo SDK 57.0.31.

---

## 7. Saved Idea Deep-Dive & Action Hub (Phase 3C)
- **Detail Route:** `IdeaDetails` in `RootStackParamList` taking `{ ideaId: string }`.
- **Authoritative Data Fetch:** Directly queries `GET /api/idea/:id` through `ideasApi.getIdeaById(id)`.
- **Validation Presentation:** Real overall score (`ScoreRing`), Phase 3B verdict thresholds (80+ Strong Potential, 60-79 Moderate Potential, <60 Needs Iteration), and breakdown ScoreBars for Market Demand, Competition, and Monetization Feasibility.
- **AI Evidence Accordions:** Collapsible explanation text for demand, competition, monetization, and overall strategic recommendation.
- **Stored Action Modules:** Inspects and conditionally renders stored modules when generated:
  - `competitorAnalysis`: Summary, competitor descriptions, and 4-quadrant SWOT matrix.
  - `pitchDeckContent`: 10-slide outline.
  - `canvasContent`: 9-block Lean Business Model Canvas.
  - `pitchSimulation`: Investor questions, founder answers, and feedback ratings.
  - If a module has not been generated for the idea, renders an honest neutral "Not generated yet" empty state.
- **Action Hub:** Navigates back to Saved Ideas and launches `ValidateModalScreen` to validate new ideas.

---

## 8. Development & Demo Top-Up Configuration (Phase 3B.1)
- **Feature Flag:** `config.features.enableDemoTopUp` in `src/config/env.ts`.
- **Default Resolution:** Enabled in `__DEV__` (local development); disabled in production (`NODE_ENV === 'production'`).
- **Standalone Demo APK Configuration:** To include the demo top-up controls in a standalone preview/personal-demo release APK, compile with `EXPO_PUBLIC_ENABLE_DEMO_TOPUP=true`.
- **Server-Side Security Enforcement:** The backend doubly restricts `POST /api/credits/simulate-payment-success`:
  1. Route-level guard: Only mounted if `NODE_ENV === 'development' || NODE_ENV === 'test'`.
  2. Controller guard: Returns HTTP 403 `DEVELOPMENT_ONLY` if not in development or test.
- **Authoritative Balance Sync:** After a simulated purchase, the mobile app calls `refreshUser()` to fetch the updated MongoDB balance from `/api/auth/me`. The mobile app never calculates or fabricates credits locally.

---

## 9. Known Limitations & Tracked Backlog
- Store-mandated in-app account deletion (`DELETE /api/auth/account`) pending backend deployment before public release.
- Native In-App Billing (Google Play / Apple StoreKit) required for production store credit purchases; web Razorpay checkout is not embedded to maintain store compliance.
- Backend request idempotency on `POST /api/idea/submit` recommended for high-volume commercial launch.
1. **In-App Account Deletion:** Apple Guideline 5.1.1(v) & Google Play policy mandate in-app deletion. Blocked on backend endpoint `DELETE /api/auth/account`.
2. **Native Digital Store Billing:** Google Play and Apple prohibit third-party checkouts (Razorpay) for in-app consumed digital credits. Native store billing needed before store launch.
3. **Backend Password/OAuth Collision:** Backend requires account linking logic when a Google OAuth user attempts local password login.
4. **Backend Request Idempotency:** `POST /api/idea/submit` lacks backend idempotency key support. Mobile mitigates by disabling automated retries and directing users to Saved Ideas on ambiguous network timeouts.
