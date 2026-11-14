# PitchMint Mobile — Architecture & System Overview

## 1. Project Identity & Repository Boundaries
- **Project Name:** `PitchMint-mobile`
- **Platform:** React Native (Expo SDK 58, React Native 0.88.1, React 19.3.0, TypeScript ~6.0.3)
- **Design Philosophy:** Native-first, Android-focused initially, iOS-ready via EAS Build. Dark-only theme inspired by the PitchMint Arena prototype (`https://01a12dcd-2c11-7ac0-9fe0-162a7be0ac4b.arena.site/`).
- **Repository Isolation:**
  - `PitchMint-mobile` is a strictly decoupled, independent repository alongside `PitchMint-Backend` and `PitchMint-frontend`.
  - No monorepos, shared package roots, or symlinked workspaces.
  - Changes in this repository must never alter or create dependencies within backend or frontend repositories.

---

## 2. Directory Structure

```
PitchMint-mobile/
├── .agents/                 # AI engineering rules and SDLC workflows
│   └── rules/               # project.md, architecture.md, coding.md, workflow.md
├── .github/                 # GitHub workflows and automation
│   ├── workflows/ci.yml     # Automated PR & push CI pipeline (Node.js 22)
│   ├── workflows/graphify-update.yml # Knowledge graph automation
│   └── dependabot.yml       # Weekly dependency and security scanning
├── assets/                  # App launcher icons, splash screen, adaptive icons
├── docs/                    # Architecture, workflow, and known-issues documentation
│   ├── ARCHITECTURE.md      # This document
│   ├── SETUP.md             # Local environment and execution guide
│   ├── development-workflow.md # SDLC, Graphify, and CI instructions
│   ├── known-issues.md      # Tracked technical debt and release considerations
│   └── personal-demo-apk-build.md # Standalone APK EAS build instructions
├── plugins/                 # Custom Expo config plugins (withCleartextTraffic.js)
├── src/
│   ├── app/                 # Root application wrapper & runtime providers
│   │   ├── App.tsx          # Root container: NavigationContainer & StatusBar
│   │   └── AppProviders.tsx # SafeAreaProvider, AuthProvider, OnboardingProvider, ErrorBoundary
│   ├── context/             # Global application contexts (AuthContext, OnboardingContext)
│   ├── navigation/          # React Navigation configuration (types.ts, RootNavigator, BottomTabNavigator, AuthNavigator)
│   ├── theme/               # Dark theme tokens (colors.ts, spacing.ts, typography.ts, index.ts)
│   ├── components/          # Reusable atomic presentation components:
│   │   ├── icons/           # Categorized SVG icons (navigation, action, status, media)
│   │   ├── IdeaCard.tsx     # Authoritative shared startup idea card presentation
│   │   ├── CreditConfirmationModal.tsx # Shared credit confirmation modal
│   │   └── ...              # Button, Card, Pill, Badge, ScoreRing, ScoreBar, Input, etc.
│   ├── features/            # Feature modules (modular components, constants, hooks, screens):
│   │   ├── activity/        # ActivityScreen (audit log of validations and credit events)
│   │   ├── auth/            # SignIn, SignUp, Forgot, Reset, Verify, Loading
│   │   ├── canvas/          # CanvasScreen, useCanvas, CanvasBlockViewer, blockDefinitions
│   │   ├── home/            # HomeScreen, HomeHeader, HomeQuickActions
│   │   ├── ideas/           # IdeasScreen, IdeaDetailsScreen, useIdeaDetails, subcomponents
│   │   ├── onboarding/      # WelcomeScreen, OnboardingScreen, StackVisual, DeckVisual
│   │   ├── pitch-deck/      # PitchDeckScreen, usePitchDeck, PitchDeckSlideViewer, slideDefinitions
│   │   ├── profile/         # ProfileScreen, ProfileHeader, SettingRow, DemoCreditTopUp
│   │   └── validate/        # ValidateModalScreen, useValidateIdea, stages, validateConstants
│   ├── api/                 # Centralized API module re-exports (index.ts)
│   ├── services/            # API client, auth API, and storage services
│   │   ├── api/apiClient.ts # Native fetch wrapper with token injection and 401 handler
│   │   ├── api/authApi.ts   # Authentication endpoints
│   │   ├── api/ideasApi.ts  # Idea validation, deck, and canvas endpoints
│   │   ├── api/creditsApi.ts# Balance, plans, and demo top-up endpoints
│   │   ├── api/activityApi.ts # Audit history endpoint
│   │   ├── auth/googleAuthService.ts # Google OAuth stub
│   │   └── storage/         # Hardware-backed SecureStore (tokenStorage, onboardingStorage)
│   ├── config/              # Safe client runtime configuration (env.ts)
│   └── utils/               # date.ts, ideaParser.ts, validation.ts
├── app.json                 # Expo project manifest (Package: com.pitchmint.app)
├── index.ts                 # Expo entrypoint (registerRootComponent)
├── App.tsx                  # Root re-export pointing to src/app/App
├── package.json             # Dependencies and diagnostics scripts
└── tsconfig.json            # Strict TypeScript configuration extending Expo base
```

---

## 3. Navigation Architecture

Navigation is implemented using **React Navigation 7** (`@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`).

1. **Top-Level Root Navigator (`src/navigation/RootNavigator.tsx`):**
   - Native stack evaluating session state (`isBootstrapping`, `isAuthenticated`, `hasCompletedOnboarding`).
   - Prevents unauthenticated screen flashing during session bootstrap (`AuthLoadingScreen`).
   - Routes unauthenticated first-time users to `WelcomeScreen` and `OnboardingScreen`.
   - Routes subsequent unauthenticated launches to `AuthNavigator`.
   - Mounts `BottomTabNavigator`, modal validation launcher (`ValidateModalScreen`), and detail screens once authenticated.

2. **Bottom Tab Navigator (`src/navigation/BottomTabNavigator.tsx`):**
   - 5-position bottom navigation bar matching the Arena prototype:
     1. **Home (`HomeScreen`):** Dashboard overview, credit balance summary (cached/optimistic), quick actions, recent ideas.
     2. **Ideas (`IdeasScreen`):** Searchable/filterable catalog of saved startup evaluations.
     3. **Center Action (+ Validate):** Prominent raised 54x54dp squircle button (`#5E17EB` with `#3904A6` edge) that intercepts tab presses to launch `ValidateModalScreen` as a modal overlay.
     4. **Activity (`ActivityScreen`):** Chronological audit log of idea evaluation runs and credit events.
     5. **Profile (`ProfileScreen`):** User identity, plan badge, security toggles, and gated demo credit top-up controls.

3. **Authentication Stack (`src/navigation/AuthNavigator.tsx`):**
   - Native stack encapsulating `SignInScreen`, `SignUpScreen`, `EmailVerificationScreen`, `ForgotPasswordScreen`, and `ResetPasswordScreen`.

4. **Dedicated Phase 4 Detail Screens:**
   - **`IdeaDetailsScreen`:** Authoritative idea view with score rings, breakdown bars, and stored module cards.
   - **`PitchDeckScreen`:** 10-slide investor deck viewer with progress tracker and 1-credit regeneration confirmation modal.
   - **`CanvasScreen`:** 9-block Lean Business Model Canvas viewer with Markdown clipboard export and 1-credit confirmation modal.

---

## 4. Design System Tokens (Arena Design Fidelity)

- **Canvas Base:** `#000000` (Pure Black Canvas)
- **Card Surfaces:**
  - `Card`: `#0A0A0A` (Primary surface, `rounded-2xl` / 16dp radius)
  - `Surface / Card-2`: `#141414` (Inputs, search bar, stat dividers)
  - `Card-3`: `#1A1A1A` (Higher elevation dialogs)
- **PitchMint Accents & 3D Elements:**
  - `Brand Accent`: `#7C3AED` (Violet brand color)
  - `Brand Soft`: `#A78BFA` (Soft violet text & active states)
  - `Signature 3D Button`: `#5E17EB` with `#3904A6` 4px bottom edge (presses 2px down)
  - `Center Validate Button`: 54x54dp squircle (`borderRadius: 18`) with violet ambient glow (`elevation: 12`)
- **Semantic Tones:**
  - Violet, Blue, Emerald, Orange, Pink, Amber, Cyan, Red, Gray (each paired with matching bg, border, and text tokens).
- **Touch Targets:** Minimum 48dp on all interactive elements (`touchTargets.minTouchSize = 48`). Center action button is 54dp (`touchTargets.fabSize = 54`).

---

## 5. State Management & API Integration

### State Management Architecture
- **Zero Heavyweight External Stores:** The application uses pure React Context without Redux, Zustand, or MobX.
- **`AuthContext` (`src/context/AuthContext.tsx`):**
  - Manages reactive session state (`user`, `token`, `isAuthenticated`, `isBootstrapping`, `error`).
  - Hydrates token on startup from `tokenStorage`.
  - Exposes authentication actions (`signIn`, `signUp`, `verifyEmail`, `resendVerification`, `forgotPassword`, `resetPassword`, `signOut`, `refreshUser`, `clearError`).
  - Hooks into global 401 interception callback with `apiClient` to purge expired sessions.
- **`OnboardingContext` (`src/context/OnboardingContext.tsx`):**
  - Tracks whether first-run walkthrough has been completed (`hasCompletedOnboarding`, `isLoadingOnboarding`).
  - Exposes `completeOnboarding()` and `resetOnboarding()`.

### Hardware-Backed Persistent Storage
- **`tokenStorage.ts`:** Encrypted storage via `expo-secure-store` under key `pitchmint_auth_token` (`keychainAccessible: AFTER_FIRST_UNLOCK` on iOS; Keystore EncryptedSharedPreferences on Android).
- **`onboardingStorage.ts`:** Hardware-backed flag under key `pitchmint_onboarding_completed`.
- **Test / Dev Fallback:** In-memory dictionary fallback prevents crashes in test runners (Jest / Node.js) where native hardware modules are unavailable.

### API Client Architecture (`src/services/api/apiClient.ts`)
- Native `fetch` wrapper with automatic JSON serialization, `X-Request-ID` UUID tracing, Bearer token injection, and structured `ApiError` exceptions.
- Global 401 Unauthorized handler to purge expired sessions without infinite redirects.
- *Tracked Limitation (API-01):* Currently lacks timeout and cancellation signals.

### Mobile API Service Endpoints
- **Authentication (`src/services/api/authApi.ts`):**
  - `POST /api/auth/register` (Account creation)
  - `POST /api/auth/verify-email` (6-digit OTP verification)
  - `POST /api/auth/resend-verification` (OTP resend)
  - `POST /api/auth/signin` (Password login)
  - `POST /api/auth/google` (Google credential exchange)
  - `POST /api/auth/forgot-password` (Password reset request)
  - `POST /api/auth/reset-password` (Token-based password reset)
  - `GET /api/auth/user` (Current profile & credit balance)
- **Ideas & Generation (`src/services/api/ideasApi.ts`):**
  - `GET /api/idea/saved` (Paginated saved startup evaluations)
  - `GET /api/idea/:id` (Authoritative idea record)
  - `POST /api/idea/submit` (AI idea evaluation — costs 1 credit)
  - `POST /api/pitchdeck/:id` / `PUT /api/pitchdeck/:id` (Generate/regenerate 10-slide deck — costs 1 credit)
  - `POST /api/canvas/:id` / `PUT /api/canvas/:id` (Generate/regenerate 9-block Lean Canvas — costs 1 credit)
- **Credits & Billing (`src/services/api/creditsApi.ts`):**
  - `GET /api/credits/balance` (Credit quota and plan tier)
  - `GET /api/credits/plans` (Credit pricing packages)
  - `POST /api/credits/simulate-payment-success` (Development-only demo credit purchase)
- **Audit Feed (`src/services/api/activityApi.ts`):**
  - `GET /api/history` (Audit log feed)

---

## 6. Credit Operations & Balance Authority

### Credit Confirmation UX Safeguard
- Before any credit-consuming user action (idea validation, pitch deck generation/regeneration, canvas generation/regeneration), the application presents an explicit confirmation modal detailing the action and its credit cost.
- Where available, the modal displays the current credit balance and estimated remaining balance after the operation.
- The confirmation dialog is strictly a **client-side UX safeguard** designed to prevent accidental deductions from unintended button presses; it is not a replacement for backend verification.

### Balance Authority & Server Responsibility
- **Non-Guaranteed Client Balance:** Any credit balance displayed on the mobile device may be cached, optimistic, or outdated. It is never guaranteed to represent the live server state.
- **Authoritative Backend Responsibility:** The backend server is solely authoritative for:
  1. Authentication and authorization verification.
  2. Idea resource ownership and access rights.
  3. Real-time credit balance verification.
  4. Atomic credit deduction and transaction processing.
  5. Transaction rollback and refund behavior upon processing failures.
- *(Note on Scope: Backend behavior has not been independently audited in this mobile task. Server rollback and refund logic are documented as backend architectural responsibilities without claiming that every live backend route has been verified to implement them).*

---

## 7. Security & Mobile Architectural Controls

### Zero-Secret Guarantee
Mobile application binaries are publicly distributable packages and can be decompiled.
- **Never embed server secrets** (`JWT_SECRET`, `GEMINI_API_KEY`, `RAZORPAY_KEY_SECRET`, MongoDB connection strings) in mobile configuration files or source code.
- Only public `EXPO_PUBLIC_*` configuration values may be bundled into client binaries.

### Secure Session Management
- **Hardware-Backed Storage:** Authentication tokens are encrypted in device hardware via `expo-secure-store` (`pitchmint_auth_token` key). Plaintext storage is prohibited.
- **Session Bootstrap:** On app launch, `AuthContext` retrieves the stored token and calls `GET /api/auth/user`. If invalid or expired, the session is purged cleanly.
- **401 Interception:** A global unauthorized interceptor triggers automatic logout and purges token storage without recursive loops.
- **Unverified Email Redirection:** When `POST /api/auth/signin` returns HTTP 401 with `emailNotVerified: true`, the app redirects to `EmailVerificationScreen` with the email pre-populated.

### Network Cleartext Traffic Policy
- `plugins/withCleartextTraffic.js` config plugin strictly disables cleartext HTTP (`android:usesCleartextTraffic="false"`) in production and preview builds. Cleartext HTTP is permitted only in local development when connecting to emulator loopbacks (`10.0.2.2`).

---

## 8. External Integrations & Configuration

### Android Package Identifier
- Configured as **`com.pitchmint.app`** in `app.json` (`android.package`).

### Google OAuth Architecture & Integration Strategy (Future Milestone)
Native Google authentication is not currently implemented; the existing codebase provides an informational placeholder stub (`src/services/auth/googleAuthService.ts`) per the Stage 1 audit.

Before implementing Google Sign-In:
1. **Approach Investigation:** Evaluate supported authentication approaches for the current Expo SDK (SDK 58) and backend contract, comparing browser-based OAuth (e.g. `expo-auth-session`) and native SDK integration.
2. **Native Build Modality:** A native SDK approach (such as `@react-native-google-signin/google-signin` or similar) may require a custom EAS development build (`expo-dev-client`).
3. **Credentials & Artifacts:** If a native SDK is chosen, configuration will require a Google Cloud Console Web Client ID (`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`), Android Client ID matching package `com.pitchmint.app` with SHA-1 fingerprint, and `google-services.json`.
4. **Decision Criteria:** The authentication strategy must be selected based on a comprehensive evaluation of compatibility with Expo SDK 58, mobile security requirements, user experience, and backend session exchange.
