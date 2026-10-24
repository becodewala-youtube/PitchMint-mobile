# PitchMint Mobile — Project Specification & Context

## 1. Product Purpose & Current Scope
**PitchMint Mobile** is an AI-assisted startup evaluation and pitch validation companion app for founders. It is built as a native-first mobile application inspired by the PitchMint Arena prototype.

### Current MVP Scope
- **Arena-Inspired Home Dashboard (`HomeScreen`):** Monthly validation quota card (e.g. 3/3 free credits), quick validation trigger, and recent validation cards.
- **Ideas Catalog (`IdeasScreen`):** Searchable list of saved startup evaluations with multi-metric score breakdown (Demand, Competition, Feasibility).
- **Raised Action Launcher (`ValidateModalScreen`):** Prominent center action button (54dp raised squircle) presenting a focused validation modal.
- **Activity Log (`ActivityScreen`):** Chronological history of idea validations, score results, and credit consumption.
- **Founder Profile (`ProfileScreen`):** User identity, current tier badge, security preferences, and release compliance tracking.
- **Onboarding & Welcome (`WelcomeScreen`, `OnboardingScreen`):** Interactive onboarding carousel persisting completed status via hardware keystore.
- **Authentication (`SignInScreen`, `SignUpScreen`, `ForgotPasswordScreen`, `ResetPasswordScreen`, `EmailVerificationScreen`, `AuthLoadingScreen`):** Session management supporting email/password and Google OAuth, hardware-backed token persistence, 401 unauthorized interception, and unverified email routing.

---

## 2. Independent Repository Boundaries
PitchMint consists of three completely decoupled, standalone repositories:
1. **`PitchMint-mobile` (this repository):** Independent React Native / Expo application.
2. **`PitchMint-Backend`:** Independent Node.js / Express / MongoDB / Gemini API server.
3. **`PitchMint-frontend`:** Independent Next.js / TailwindCSS web application.
4. **`design-mobile-app-from-website`:** Read-only design reference.

### Strict Boundary Rules
- **NEVER** create a monorepo, symlinked packages, shared workspaces, or cross-repository imports.
- **NEVER** edit files in `PitchMint-Backend`, `PitchMint-frontend`, or `design-mobile-app-from-website` while working in `PitchMint-mobile`.
- Treat backend APIs as external HTTP contracts.

---

## 3. Technology Stack
- **Framework:** Expo SDK 57 (Continuous Native Generation / CNG, EAS Build ready)
- **Runtime:** React Native 0.86.3, React 19.2.3
- **Language:** TypeScript 6.0.3 (Strict mode, noEmit typechecking)
- **Navigation:** React Navigation 7 (`@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`)
- **Persistence:** Hardware-backed `expo-secure-store` (iOS Keychain / Android Keystore EncryptedSharedPreferences) with resilient test/fallback memory store
- **Testing:** Jest 29.7, `jest-expo`, `@testing-library/react-native`
- **Quality & Diagnostics:** `tsc --noEmit`, `expo-doctor`, Android bundle export checks

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
- **Touch Targets:** Minimum 48dp on all interactive elements (center validate button is 54dp).

---

## 5. Backend Integration & Configuration
- **API Client:** `src/services/api/apiClient.ts` uses native `fetch` with token injection, timeout handling, and 401 interceptors.
- **Environment Configuration:** `src/config/env.ts` reads `EXPO_PUBLIC_API_URL` safely with fallback to `http://localhost:4000`.
- **Zero-Secret Guarantee:** Client binaries are publicly distributed. Server credentials (JWT secret, Gemini API key, Razorpay secrets, database connection strings) are **strictly forbidden** in mobile client code or configurations.

---

## 6. Standard Execution & Verification Commands
Always run these commands from the `PitchMint-mobile/` root:

```bash
# Typecheck TypeScript without emitting JS
npm run typecheck

# Run unit and integration tests
npm test

# Run Expo dependency and configuration diagnostics
npm run doctor

# Validate Android JS bundle export
npx expo export --platform android

# Start development server
npm run start
```
