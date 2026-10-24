# PitchMint Mobile — Architecture & System Overview

## 1. Project Identity & Repository Boundaries
- **Project Name:** `PitchMint-mobile`
- **Platform:** React Native (Expo SDK 57, TypeScript 6)
- **Design Philosophy:** Native-first, Android-focused initially, iOS-ready via EAS Build.
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
│   ├── workflows/ci.yml     # Automated PR & push CI pipeline
│   └── dependabot.yml       # Weekly dependency and security scanning
├── assets/                  # App launcher icons, splash screen, adaptive icons
├── docs/                    # Architecture, workflow, and known-issues documentation
│   ├── ARCHITECTURE.md      # This document
│   ├── SETUP.md             # Local environment and execution guide
│   ├── development-workflow.md # SDLC and CI instructions
│   └── known-issues.md      # Tracked public-release blockers and security notes
├── src/
│   ├── app/                 # Root application wrapper & runtime providers
│   │   ├── App.tsx          # Root container: NavigationContainer & StatusBar
│   │   └── AppProviders.tsx # SafeAreaProvider, AuthProvider, OnboardingProvider
│   ├── context/             # Global application contexts
│   │   ├── AuthContext.tsx  # User session, JWT state, login/logout actions
│   │   └── OnboardingContext.tsx # Onboarding status and completion actions
│   ├── navigation/          # React Navigation configuration
│   │   ├── types.ts         # Strictly typed ParamLists (RootStack, MainTab, AuthStack)
│   │   ├── RootNavigator.tsx# Root Stack Navigator (AuthLoading, Onboarding, Auth, MainTabs)
│   │   ├── BottomTabNavigator.tsx # 5-position bottom tab bar + raised Validate CTA
│   │   └── AuthNavigator.tsx# Authentication stack (SignIn, SignUp, Forgot, Reset, Verify)
│   ├── theme/               # Dark theme tokens inspired by Arena prototype
│   │   ├── colors.ts        # Palette: #000000 base, card surfaces, #7C3AED violet
│   │   ├── spacing.ts       # Layout grid, border radiuses, 48dp touch targets, shadows
│   │   ├── typography.ts    # Scaled type sizes and font weights
│   │   └── index.ts         # Consolidated export and navigationDarkTheme
│   ├── components/          # Reusable atomic presentation components
│   │   ├── ScreenContainer.tsx # Safe-area & scroll wrapper
│   │   ├── Card.tsx         # Dark elevated card surface
│   │   ├── AuthCard.tsx     # Form wrapper card for authentication screens
│   │   ├── Badge.tsx        # Status & score pill chips
│   │   ├── Pill.tsx         # Multi-state filter chips
│   │   ├── ScoreBar.tsx     # Visual validation score indicator
│   │   ├── Button.tsx       # 48dp minimum accessible button with feedback
│   │   ├── GoogleSignInButton.tsx # Branded Google OAuth button
│   │   ├── Input.tsx        # Accessible styled text input with error display
│   │   ├── Icon.tsx         # Zero-dependency native vector primitives
│   │   └── index.ts
│   ├── features/            # Feature modules and screens
│   │   ├── home/screens/HomeScreen.tsx       # Welcome, credits card, recent validations
│   │   ├── ideas/screens/IdeasScreen.tsx     # Saved ideas catalog with score filters
│   │   ├── validate/screens/ValidateModalScreen.tsx # Center (+) modal validation launcher
│   │   ├── activity/screens/ActivityScreen.tsx # Chronological log (replaces Toolkit)
│   │   ├── profile/screens/ProfileScreen.tsx # Founder profile & compliance notices
│   │   ├── onboarding/screens/               # WelcomeScreen.tsx & OnboardingScreen.tsx
│   │   └── auth/screens/                     # SignIn, SignUp, Forgot, Reset, Verify, Loading
│   ├── services/            # API client, auth API, and storage services
│   │   ├── api/apiClient.ts # Native fetch wrapper with token injection and 401 handler
│   │   ├── api/authApi.ts   # Backend auth endpoints
│   │   ├── auth/googleAuthService.ts # Google OAuth native integration
│   │   └── storage/         # Hardware-backed SecureStore (tokenStorage, onboardingStorage)
│   ├── config/              # Safe client runtime configuration
│   │   └── env.ts           # Environment variables without server secrets
│   └── utils/               # Validation helpers (email, password strength)
├── app.json                 # Expo project manifest (dark theme, portrait orientation)
├── index.ts                 # Expo entrypoint (registerRootComponent)
├── App.tsx                  # Root re-export pointing to src/app/App
├── package.json             # Dependencies and diagnostics scripts
└── tsconfig.json            # Strict TypeScript configuration extending Expo base
```

---

## 3. Navigation Architecture

The visual shell implements a **5-position bottom navigation hierarchy** inspired by the PitchMint Arena prototype (`https://01a12dcd-2c11-7ac0-9fe0-162a7be0ac4b.arena.site/`):

1. **Home (`HomeScreen`):** Dashboard overview, current monthly credit quota (3/3 free), quick validation launcher, and recent validation cards.
2. **Ideas (`IdeasScreen`):** Searchable/filterable catalog of saved startup evaluations with multi-metric score breakdown (Demand, Competition, Feasibility).
3. **Center Action (+ Validate):** A prominent raised 52x52dp purple button (`#7C3AED`) with purple glow that intercepts tab switching and presents `ValidateModalScreen` as a native modal.
4. **Activity (`ActivityScreen`):** Chronological audit log of idea validation runs, credit deductions, and renewals. Replaces the deferred web "Toolkit" destination.
5. **Profile (`ProfileScreen`):** User identity, plan badge, security preferences, and release compliance tracking.

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
  - `Center Validate Button`: 54x54dp squircle (`rounded-[18px]`) with purple ambient glow
- **Semantic Tones:**
  - Violet, Blue, Emerald, Orange, Pink, Amber, Cyan, Red, Gray (each with paired bg, border, and text values)
- **Touch Targets:** Minimum 48dp on all interactive elements. Center action button is 54dp.

---

## 5. Security & Mobile Compliance Blockers

### Zero-Secret Rule
Mobile application binaries are publicly distributable packages and can be decompiled.
- **Never embed server secrets** (`JWT_SECRET`, `GEMINI_API_KEY`, `RAZORPAY_KEY_SECRET`, MongoDB URIs) into mobile configuration files or source code.
- Phase 1 connects to no external networks or backend servers.

### Tracked Release Blockers (Before Public Store Release)
1. **In-App Account Deletion:**
   - Apple App Store Guideline 5.1.1(v) and Google Play Data Safety policies strictly require an in-app account deletion flow.
   - Requires adding `DELETE /api/auth/account` to `PitchMint-Backend` prior to public store release.
2. **Google Play Digital Goods Billing:**
   - Both Google Play and Apple prohibit third-party web checkouts (such as Razorpay) for digital credits consumed inside store-distributed binaries.
   - Public release must utilize native Google Play Billing (or User Choice Billing). Razorpay checkout is not embedded in the mobile client.
3. **Google Account Linking with Local Password Accounts:**
   - Backend issue where Google OAuth accounts without passwords collide with password logins. Tracked in backend backlog; mobile client prevents account collision and directs users accordingly.

---

## 6. Phase 2: Authentication & Secure Session Storage

### Security Architecture
- **Secure Storage:** Tokens are encrypted in hardware-backed storage via `expo-secure-store` (iOS Keychain / Android Keystore EncryptedSharedPreferences). Plaintext `localStorage` or `AsyncStorage` is prohibited.
- **Bootstrap Lifecycle:** Initial launch reads the stored token and calls `GET /api/auth/user`. While bootstrapping, `AuthLoadingScreen` is mounted. Authenticated tabs are never flashed prematurely.
- **401 Interception:** An unauthorized interceptor triggers automatic logout and purges token storage without recursive loops.
- **Unverified Email Routing:** When `POST /api/auth/signin` returns HTTP 401 with `emailNotVerified: true`, the app routes directly to `EmailVerificationScreen` with the email pre-populated.

### Required External Google OAuth Configuration (Post-EAS Build)
1. **Google Cloud Console Web Client ID:**
   - Matches backend `GOOGLE_CLIENT_ID` (`EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`).
2. **Google Cloud Console Android Client ID:**
   - Package name: `com.pitchmint.mobile`.
   - SHA-1 Certificate Fingerprint: generated from local debug keystore or EAS Build credentials.
3. **Google Services File:**
   - `google-services.json` placed in root and declared in `app.json` (`android.googleServicesFile`).
4. **Native Library:**
   - `@react-native-google-signin/google-signin` configured via config plugin for custom development build (`npx expo run:android` / EAS Build).

