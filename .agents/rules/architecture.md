# PitchMint Mobile — Source Architecture & Responsibilities

This document maps the **actual verified codebase structure** of `PitchMint-mobile`. All paths exist and are verified against the active source tree.

---

## 1. App Bootstrap & Providers
- **`index.ts`:** Application entrypoint; invokes `registerRootComponent(App)` from `expo`.
- **`App.tsx`:** Thin re-export bridging the root directory to `src/app/App.tsx`.
- **`src/app/App.tsx`:** Root application component configuring `NavigationContainer` (with custom dark theme), `StatusBar`, and embedding `AppProviders`.
- **`src/app/AppProviders.tsx`:** Composes `SafeAreaProvider`, `OnboardingProvider`, `AuthProvider`, and `AppErrorBoundary` for crash isolation.

---

## 2. Navigation Architecture & Route Types
- **`src/navigation/types.ts`:**
  - `RootStackParamList`: Defines top-level routes (`AuthLoading`, `OnboardingStack`, `AuthStack`, `MainTabs`, `ValidateModal`).
  - `MainTabParamList`: Defines the 5-tab structure (`HomeTab`, `IdeasTab`, `ValidateTab`, `ActivityTab`, `ProfileTab`).
  - `AuthStackParamList`: Defines auth subroutes (`SignIn`, `SignUp`, `ForgotPassword`, `ResetPassword`, `EmailVerification`).
- **`src/navigation/RootNavigator.tsx`:**
  - Evaluates `useAuth()` (`isLoading`, `isAuthenticated`) and `useOnboarding()` (`hasCompletedOnboarding`).
  - Renders `AuthLoadingScreen` during initial token hydration.
  - Renders onboarding screens if onboarding is incomplete.
  - Renders `AuthNavigator` if user is unauthenticated.
  - Renders `BottomTabNavigator` with modal overlay support once authenticated.
- **`src/navigation/BottomTabNavigator.tsx`:**
  - Implements the 5-position bottom navigation bar.
  - Center position intercepts tab switching to launch `ValidateModalScreen` as a full modal screen.
- **`src/navigation/AuthNavigator.tsx`:**
  - Native stack navigator encapsulating authentication screens with dark-themed screen options.

---

## 3. Authentication & Session Persistence
- **`src/context/AuthContext.tsx`:**
  - Manages reactive session state (`token`, `user`, `isLoading`, `isAuthenticated`).
  - Hydrates token on startup from `tokenStorage`.
  - Exposes `signIn`, `signUp`, `signOut`, `refreshUser`, and `setSession`.
  - Configures 401 interception callback with `apiClient` to purge expired sessions.
- **`src/services/storage/tokenStorage.ts`:**
  - Encrypted storage via `expo-secure-store` with memory-store fallback for test runners.
  - Stores access token under key `pitchmint_auth_token`.
- **`src/services/auth/googleAuthService.ts`:**
  - Manages Google OAuth token acquisition and native client handoff.

---

## 4. API Client & Backend Services
- **`src/services/api/apiClient.ts`:**
  - Native `fetch` wrapper supporting request timeout (15s default), automatic `Authorization: Bearer <token>` injection, JSON serialization, and structured `ApiError` exceptions.
  - Registers an unauthorized (401) listener for clean session invalidation without loops.
- **`src/services/api/authApi.ts`:**
  - Typed API calls matching `PitchMint-Backend` routes:
    - `POST /api/auth/signin`
    - `POST /api/auth/signup`
    - `GET /api/auth/user`
    - `POST /api/auth/forgot-password`
    - `POST /api/auth/reset-password`
    - `POST /api/auth/verify-email`
    - `POST /api/auth/resend-verification`
    - `POST /api/auth/google`

---

## 5. Onboarding Persistence & Lifecycle
- **`src/context/OnboardingContext.tsx`:**
  - Tracks whether the user has completed onboarding (`hasCompletedOnboarding`).
  - Exposes `completeOnboarding()` and `resetOnboarding()`.
- **`src/services/storage/onboardingStorage.ts`:**
  - Persists flag under key `pitchmint_onboarding_completed` via `expo-secure-store` with fallback memory store.

---

## 6. Feature Screens & Locations
- **`src/features/home/screens/HomeScreen.tsx`:** Dashboard overview, credits remaining, quick validation card, recent validations list.
- **`src/features/ideas/screens/IdeasScreen.tsx`:** Saved startup ideas catalog with search and score pills.
- **`src/features/validate/screens/ValidateModalScreen.tsx`:** Interactive validation launcher modal (target audience, problem statement, solution).
- **`src/features/activity/screens/ActivityScreen.tsx`:** Chronological audit log of idea evaluation runs.
- **`src/features/profile/screens/ProfileScreen.tsx`:** User profile, tier badge, security toggles, and compliance notices.
- **`src/features/onboarding/screens/`:**
  - `WelcomeScreen.tsx`: High-impact introductory screen with Arena branding.
  - `OnboardingScreen.tsx`: 3-step value proposition carousel with progress indicator.
- **`src/features/auth/screens/`:**
  - `SignInScreen.tsx`: Email/password and Google OAuth login. Prepopulates email when redirected from unverified state.
  - `SignUpScreen.tsx`: Account creation with password strength checks.
  - `ForgotPasswordScreen.tsx`: Password recovery email request.
  - `ResetPasswordScreen.tsx`: New password entry via token.
  - `EmailVerificationScreen.tsx`: 6-digit OTP code entry with resend cooldown.
  - `AuthLoadingScreen.tsx`: Splash/loader displayed during token validation.

---

## 7. Reusable UI Components & Theme Tokens
- **`src/theme/`:**
  - `colors.ts`: Base canvas `#000000`, card surfaces, semantic status tones, brand accents (`#7C3AED`, `#A78BFA`).
  - `spacing.ts`: 8-point layout grid, border radiuses, touch targets (48dp min, 54dp CTA).
  - `typography.ts`: Mobile type scales, font sizes, line heights, and weights.
  - `index.ts`: Consolidated exports and `navigationDarkTheme`.
- **`src/components/`:**
  - `ScreenContainer.tsx`: Keyboard-aware and safe-area scroll view wrapper.
  - `Card.tsx`: Dark elevated card surface with subtle border.
  - `AuthCard.tsx`: Specialized container card for authentication forms.
  - `Button.tsx`: Accessible interactive button with loading state and 3D press feedback.
  - `GoogleSignInButton.tsx`: Branded Google OAuth button matching Google brand guidelines.
  - `Input.tsx`: Dark-styled text input with label, error display, icon adornments, and password toggle.
  - `Icon.tsx`: Zero-dependency native vector glyphs.
  - `Badge.tsx`: Status chip and score tag.
  - `Pill.tsx`: Filter chip for selection lists.
  - `ScoreBar.tsx`: Visual multi-segment validation score indicator.

---

## 8. Configuration & Utilities
- **`src/config/env.ts`:** Environment variables safely parsed from `process.env.EXPO_PUBLIC_*`.
- **`src/utils/validation.ts`:** Email format validation, password strength scoring, required field checks.
