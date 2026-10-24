# PitchMint Mobile — Setup and Developer Guide

## Prerequisites
- Node.js (v20+ recommended, current environment: Node v22.22.2)
- npm (v10+, current environment: npm 11.3.0)
- Android Studio / Android Emulator or Expo Go app on a physical Android device

---

## Quick Start

1. Navigate to the mobile project root:
   ```bash
   cd PitchMint-mobile
   ```

2. Validate TypeScript compilation:
   ```bash
   npm run typecheck
   ```

3. Run Expo dependency diagnostics:
   ```bash
   npm run doctor
   ```

4. Launch the Expo development server:
   ```bash
   npm start
   ```

5. Run on targets:
   - **Physical Android Device:** Install **Expo Go** from Google Play Store, ensure device is on the same Wi-Fi, and scan the QR code displayed in the terminal.
   - **Android Emulator:** Press `a` in the terminal while an Android emulator is running.
   - **Web Sandbox:** Run `npm run web` (requires `@expo/metro-runtime` if running on desktop browser).

---

## Available Scripts

| Script | Command | Purpose |
| :--- | :--- | :--- |
| `npm start` | `expo start` | Starts the Metro development server with QR code |
| `npm run typecheck` | `tsc --noEmit` | Validates TypeScript strict mode compliance |
| `npm run doctor` | `npx expo-doctor` | Evaluates dependencies and Expo SDK configuration |
| `npm run android` | `expo start --android` | Boots directly to connected Android device or emulator |
| `npm run ios` | `expo start --ios` | Boots to iOS simulator (macOS required) |
