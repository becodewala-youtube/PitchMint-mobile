# PitchMint Mobile — Known Issues & Release Blockers

This document tracks known limitations, external dependencies, and public release blockers for `PitchMint-mobile`.

---

## 1. Store Compliance Blockers (Prior to Public Store Launch)

### A. Mandatory In-App Account Deletion
- **Policy Reference:** Apple App Store Review Guideline 5.1.1(v) and Google Play Data Safety Policy.
- **Requirement:** Any app supporting account creation must provide an explicit, readily discoverable in-app account deletion mechanism.
- **Current State:** The mobile app UI is prepared, but execution requires the backend to implement and deploy `DELETE /api/auth/account`.
- **Action Required:** Backend team must deploy this endpoint before production binary submission to App Store and Google Play.

### B. In-App Digital Goods Billing vs. Web Checkout
- **Policy Reference:** Google Play Billing Policy (Section 3) and Apple App Store Review Guideline 3.1.1.
- **Requirement:** Digital goods consumed directly within the app (such as idea validation credits) must use Google Play In-App Billing / Apple In-App Purchase. Third-party web payment gateways (e.g. Razorpay web checkouts) are prohibited for in-app credit consumption.
- **Current State:** PitchMint web uses Razorpay. The mobile app does not embed Razorpay checkout webviews to prevent immediate store rejection.
- **Action Required:** Post-MVP integration of native in-app billing (`react-native-iap` or Expo In-App Purchases) before public store distribution.

### C. Google OAuth & Local Password Collision
- **Issue:** If a user registers first via Google OAuth (which creates a backend account with no local password), a subsequent attempt to log in using the email/password form fails or collides in the backend.
- **Current State:** Mobile auth client checks response codes and routes unverified or conflicting users safely.
- **Action Required:** Backend account-linking flow to associate passwords or prompt Google Sign-In when a collision occurs.

---

## 2. Dependency & Security Advisories Analysis

### Transitive Build-Tooling Advisories (`npm audit`)
Running `npm audit` on Expo SDK 57 reports moderate/high advisories for `node-forge`, `uuid`, and `zod`:
- **`node-forge` (GHSA-86w9-cpqp-85rv):** Transitive dependency of `@expo/cli` -> `@expo/code-signing-certificates`.
- **`uuid` (GHSA-w5hq-g745-h8pq):** Transitive dependency of `@expo/config-plugins` -> `xcode`.
- **`zod` (GHSA-mrhx-c7xc-m3w5):** Transitive dependency of `@expo/cli`.

**Assessment & Impact:**
- **Zero Runtime Impact on Production Mobile Binaries:** These packages are build-time and CLI developer dependencies. They are not bundled into the Android Hermes `.hbc` binary or distributed to end users.
- **Do Not Run `npm audit fix --force`:** Running `npm audit fix --force` attempts to downgrade Expo to `44.0.6` (2022 release), which breaks the entire application.
- **Resolution:** These transitive dependencies will be updated upstream by the Expo team in subsequent SDK maintenance releases.

---

## 3. Expo SDK Patch Version Alignment
- **Current Version:** `expo@~57.0.31`
- **Status:** Resolved on `main` (merged via PR #3).
- **Diagnostic Result:** `npx expo-doctor` passes all 21/21 checks cleanly with zero patch mismatches detected.
- **Compatibility:** `npx expo install --check` validates that core dependencies (`expo`, `expo-secure-store`, `expo-status-bar`, `react-native`, `react`) match Expo SDK 57 recommended specifications.
