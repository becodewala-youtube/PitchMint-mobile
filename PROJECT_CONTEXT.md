# PitchMint Mobile — Verified Project Context

This document captures the verified facts, versions, scripts, and status of `PitchMint-mobile` as of October 2026.

---

## 1. Stack & Dependency Versions
- **Expo SDK:** `~57.0.28` (Target patch: `~57.0.31`)
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
│   ├── workflows/ci.yml     # Automated CI verification workflow
│   └── dependabot.yml       # Dependency update schedule and group policy
├── assets/                  # Launcher icon, splash screen, adaptive icons
├── docs/                    # Architecture, known issues, and workflow docs
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
- **Test Suites:** 10 passed, 10 total.
- **Tests:** 75 passed, 75 total.
- **TypeScript:** Clean pass (`tsc --noEmit` exits 0).
- **Android JS Export:** Passes (`npx expo export --platform android` bundles 884 modules into Hermes bytecode).
- **Expo Doctor:** 20/21 passed on SDK 57.0.28 (1 patch version mismatch: `expo ~57.0.31` expected; addressed in patch PR).

---

## 7. Known Limitations & Tracked Backlog
1. **In-App Account Deletion:** Apple Guideline 5.1.1(v) & Google Play policy mandate in-app deletion. Blocked on backend endpoint `DELETE /api/auth/account`.
2. **Native Digital Store Billing:** Google Play and Apple prohibit third-party checkouts (Razorpay) for in-app consumed digital credits. Native store billing needed before store launch.
3. **Backend Password/OAuth Collision:** Backend requires account linking logic when a Google OAuth user attempts local password login.
