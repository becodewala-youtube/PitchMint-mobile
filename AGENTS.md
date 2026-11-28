# PitchMint Mobile — Agent Instructions

PitchMint Mobile is the independent React Native / Expo mobile application for the PitchMint startup assessment platform.

## 1. Repository Boundaries & Isolation
- **Independent Repository:** `PitchMint-mobile` is strictly decoupled from `PitchMint-Backend` and `PitchMint-frontend`.
- **Zero Monorepo / Cross-Repo Dependencies:** Never create monorepos, symlinks, or cross-workspace imports. Never alter files in `PitchMint-Backend`, `PitchMint-frontend`, or `design-mobile-app-from-website`.
- **External HTTP Contract:** Treat the backend strictly as an external HTTP API reachable via `EXPO_PUBLIC_API_URL` (default: `https://pitch-mint-backend.vercel.app`).

## 2. Verified Technology Stack
- **Framework:** Expo SDK 58 (`~58.1.0`, Continuous Native Generation / CNG, EAS ready)
- **Runtime:** React Native 0.88.1, React 19.3.0, TypeScript `~6.0.3` (Strict mode)
- **Navigation:** React Navigation 7 (`@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`). Do NOT use Expo Router.
- **Persistence:** Hardware-backed `expo-secure-store` with memory-store fallback for test/non-native environments.
- **Design System:** Dark-only Arena design system (Base `#000000`, violet accent `#7C3AED`, 48dp minimum touch targets).

## 3. Mandatory Git Safety Procedure
Before creating or modifying any feature branch, always execute:
1. **Inspect Working Tree:** Run `git status --short --branch` and `git status --porcelain=v1`. If untracked or uncommitted changes exist, STOP immediately.
2. **Synchronize Main:** Switch to `main` and execute `git pull --ff-only origin main`.
3. **Graphify Freshness Check:** If latest `main` changes affect Graphify path filters (`src/**`, `package.json`, `index.ts`, `App.tsx`, `tsconfig.json`), verify the `Update Graphify Code Graph` GitHub Actions run completed successfully (both extraction and commit jobs). If a graph update commit was produced on `main`, pull `main` again (`git pull --ff-only origin main`) before branching. Do not branch while the required run is in progress. (Documentation-only changes do not require a run; see [`.agents/rules/workflow.md`](.agents/rules/workflow.md) for full operational guidance).
4. **Branch Conflict Check:** Verify the target branch does not already exist locally or remotely.
5. **Isolated Branch Creation:** Create the feature branch directly from synchronized `main` (`git switch -c <type>/<name>`). Never branch from an outdated feature branch. Never commit directly to `main`.

## 4. Mandatory Engineering & Security Rules
- **Authoritative Security Rules:** Always follow [`.agents/rules/security.md`](.agents/rules/security.md) and [`docs/SECURITY.md`](docs/SECURITY.md).
- **Zero Secrets in Client Code:** Never place private server secrets (`JWT_SECRET`, `GEMINI_API_KEY`, `RAZORPAY_KEY_SECRET`, database URIs) in client code or configuration. Never commit `.env` or `.env*.local`; only public `EXPO_PUBLIC_*` variables may be bundled into client binaries.
- **Privacy & Logging:** Never log passwords, authentication tokens, OTP verification codes, or private user payload data. Use `logDevWarning` (`src/utils/logger.ts`) for sanitized `__DEV__`-only diagnostics.
- **Testing & Verification:** Every functional or security change must include or update co-located Jest tests. Always verify `npm run security:check`, `npm run typecheck`, and `npm test` pass before proposing changes.
- **Human Approval Gate:** Never merge pull requests, deploy, rotate credentials, rewrite Git history, or publish releases autonomously. The project owner must review the complete diff and explicitly authorize all merges.

## 5. Standard Verification Commands
Execute these commands from the `PitchMint-mobile/` root:
```bash
npm run security:check             # Verify .env untracked, zero secrets, 500-line limit, EAS flags
npm run typecheck                  # Verify TypeScript strict compliance
npm test                           # Run complete Jest test suite
npm run doctor                     # Run Expo diagnostics
npx expo install --check           # Verify Expo SDK package compatibility
npx expo export --platform android # Validate Android JS bundle export
npm audit --audit-level=high       # Check high/critical dependency advisories
```

## 6. Project Documentation Index
- **Authoritative Technical Context:** [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md)
- **Authoritative Security Guide:** [`docs/SECURITY.md`](docs/SECURITY.md)
- **Agent Rules Directory:** [`.agents/rules/`](.agents/rules/)
  - Project Scope & Boundaries: [`.agents/rules/project.md`](.agents/rules/project.md)
  - Codebase Architecture: [`.agents/rules/architecture.md`](.agents/rules/architecture.md)
  - Coding Conventions: [`.agents/rules/coding.md`](.agents/rules/coding.md)
  - Security & Governance Rules: [`.agents/rules/security.md`](.agents/rules/security.md)
  - SDLC & Git Lifecycle: [`.agents/rules/workflow.md`](.agents/rules/workflow.md)
- **Technical Guides:**
  - Architecture Deep-Dive: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
  - Security Architecture & Runbook: [`docs/SECURITY.md`](docs/SECURITY.md)
  - Development Workflow & CI: [`docs/development-workflow.md`](docs/development-workflow.md)
  - Google Sign-In Setup: [`docs/google-sign-in-setup.md`](docs/google-sign-in-setup.md)
  - Technical Debt & Known Issues: [`docs/known-issues.md`](docs/known-issues.md)
  - Setup Guide: [`docs/SETUP.md`](docs/SETUP.md)
  - Personal Demo APK Build: [`docs/personal-demo-apk-build.md`](docs/personal-demo-apk-build.md)
