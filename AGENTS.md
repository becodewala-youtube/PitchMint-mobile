# PitchMint Mobile — Agent Instructions

This is the independent React Native / Expo mobile application for the PitchMint platform.

## Repository Boundaries & Isolation
1. **Decoupled Repositories:** `PitchMint-mobile` is an independent repository alongside `PitchMint-Backend` and `PitchMint-frontend`.
2. **Never Create Monorepos or Cross-Repo Links:** Do not create monorepos, symlinks, or cross-workspace dependencies. Never modify files outside `PitchMint-mobile`.
3. **Read-Only Design Reference:** `design-mobile-app-from-website` is purely reference material.

## Architecture & Technology Stack
- **Framework:** Expo SDK 57 (Continuous Native Generation / CNG, EAS ready)
- **Runtime:** React Native 0.86.3, React 19.2.3, TypeScript 6.0.3 (Strict)
- **Navigation:** React Navigation 7 (`@react-navigation/native`, `@react-navigation/native-stack`, `@react-navigation/bottom-tabs`). Do NOT use Expo Router.
- **Persistence:** Hardware-backed `expo-secure-store` with memory-fallback for testing.
- **Design:** Dark-only Arena design system (Base `#000000`, violet accent `#7C3AED`, 48dp min touch targets).

## Mandatory Engineering Rules
- **Zero Secrets:** Never place server secrets (`JWT_SECRET`, `GEMINI_API_KEY`, etc.) in client code or configurations.
- **No Unsafe Logging:** Never log passwords, tokens, or sensitive payloads.
- **Testing:** Every change must include or update tests. Always verify `npm test` and `npm run typecheck` pass.
- **Approval Gate:** Never merge pull requests or deploy autonomously. The owner must review and approve all PRs.

## Verification Commands
```bash
npm run typecheck                  # Verify TypeScript compiler
npm test                           # Run complete Jest test suite
npm run doctor                     # Run Expo diagnostics
npx expo export --platform android # Validate Android JS bundle export
```

## Detailed Documentation Directory
- Comprehensive Rules: [`.agents/rules/`](.agents/rules/)
  - Project Scope: [`.agents/rules/project.md`](.agents/rules/project.md)
  - Architecture: [`.agents/rules/architecture.md`](.agents/rules/architecture.md)
  - Coding Standards: [`.agents/rules/coding.md`](.agents/rules/coding.md)
  - SDLC Workflow: [`.agents/rules/workflow.md`](.agents/rules/workflow.md)
- Verified Project Facts: [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md)
- Architecture Deep Dive: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Known Issues & Blockers: [`docs/known-issues.md`](docs/known-issues.md)
- Development Workflow: [`docs/development-workflow.md`](docs/development-workflow.md)
