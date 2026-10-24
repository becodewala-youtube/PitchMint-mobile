# PitchMint Mobile — Coding Conventions & Standards

All engineers and AI agents working on `PitchMint-mobile` must adhere to these standards:

---

## 1. TypeScript & Language Standards
- **Strict Typing:** Never use `any`. Use strict interfaces, type unions, or generic parameters.
- **Compiler Compliance:** Code must pass `tsc --noEmit` without errors or warnings.
- **Null Safety:** Explicitly handle `null` and `undefined`. Do not use non-null assertion (`!`) unless guaranteed by prior guards.
- **File Extensions:** Use `.tsx` for files containing React components and `.ts` for pure TypeScript modules, types, and services.

---

## 2. Component Design & Code Structure
- **Reuse Existing Primitives:**
  - Use `src/components/` primitives (`Button`, `Card`, `AuthCard`, `Input`, `ScreenContainer`, `Badge`, `Icon`) before creating new UI controls.
  - Use `src/theme/` design tokens for all colors, spacing, border radiuses, and typography. Never hardcode ad-hoc hex values.
- **Accessibility & Native Touch Targets:**
  - All interactive touch targets (`Pressable`, `TouchableOpacity`, buttons) must meet the **minimum 48x48dp size** requirement.
  - Floating action buttons and primary actions must meet or exceed 54dp.
  - Include appropriate `accessibilityRole` and `accessibilityLabel` where applicable.
- **No Speculative Abstractions:**
  - Keep changes small, focused, and maintainable.
  - Do not introduce Redux, Zustand, React Query, or other state-management libraries without proven architectural need.
  - Do not create premature generic abstractions for one-off features.

---

## 3. Security & Privacy Mandates
- **Zero Secrets in Code:**
  - **NEVER** commit API secrets, private keys, service account credentials, database connection strings, or machine-specific network addresses.
  - Use `EXPO_PUBLIC_*` strictly for public configuration values (e.g. backend base URL).
- **No Sensitive Data Logging:**
  - **NEVER** log passwords, JWT tokens, OTP verification codes, or private user payload data to `console.log` or debug statements.
  - Sanitize error objects before logging.
- **Hardware-Backed Credential Storage:**
  - Always store authentication tokens and sensitive credentials in `expo-secure-store` (via `tokenStorage`).
  - Never store auth tokens in plaintext `AsyncStorage` or unencrypted local storage.

---

## 4. Testing & Regression Protection
- **Mandatory Tests:**
  - Every bug fix, navigation alteration, or new service function must include corresponding Jest tests.
  - Place unit and component tests in co-located `__tests__/` directories (e.g. `src/features/auth/__tests__/`).
- **Resilient Mocking:**
  - Mock native hardware interfaces (`expo-secure-store`, `@react-native-google-signin/google-signin`, `react-native-screens`) using stable mocks that do not leak handles or timers.
  - Ensure all test suites pass without unhandled rejections or unclosed timers.
- **Honest Test Reporting:**
  - Report exact test counts, failing suites, and pass/fail metrics.
  - Never suppress or skip failing tests to give a false impression of success.
