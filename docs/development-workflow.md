# PitchMint Mobile — Development Workflow & Tooling Guide

This guide details local development commands, verification practices, Graphify knowledge graph automation, and CI/CD pipelines for `PitchMint-mobile`.

---

## 1. Local Development Commands

All commands must be executed from the root of `PitchMint-mobile`:

| Command | Exact Command | Purpose | When to Run |
| :--- | :--- | :--- | :--- |
| `npm start` | `expo start` | Starts Metro development server with QR code | Active feature development |
| `npm run android` | `expo start --android` | Boots directly to connected Android device/emulator | Native UI testing |
| `npm run ios` | `expo start --ios` | Boots to iOS simulator (macOS required) | iOS validation |
| `npm run web` | `expo start --web` | Starts web preview | Browser sanity check |
| `npm run typecheck` | `tsc --noEmit` | Strict TypeScript compiler validation | Pre-commit, every code change |
| `npm test` | `jest` | Runs complete Jest unit and component test suite | Pre-commit, every code change |
| `npm run doctor` | `npx expo-doctor` | Evaluates dependencies and Expo SDK configuration | Dependency bumps & pre-PR |
| `npm run export:android` | `expo export --platform android` | Bundles Metro JS into Android Hermes bytecode (`dist/`) | Pre-PR and release verification |

---

## 2. Graphify Knowledge Graph Workflow

Graphify produces a repository-local semantic and architectural graph of the codebase, assisting developers and AI agents in exploring relationships between modules.

### Prerequisites
- Python 3.10+ (Verified on Python 3.12)
- `graphifyy` package installed (`pip install graphifyy`)

### Generation Commands
To generate the code graph deterministically without incurring external API or LLM token costs:
```bash
# Convenience npm script (runs extract, cluster, and html export)
npm run graphify:update

# Or run individual commands:
npm run graphify:extract    # python -m graphify extract . --code-only
python -m graphify cluster-only .
npm run graphify:html       # python -m graphify export html
```

### Generated & Tracked Deliverables (`graphify-out/`)
- `graphify-out/graph.json`: Raw graph structure containing nodes, edges, and community clusters.
- `graphify-out/GRAPH_REPORT.md`: Architectural summary including god nodes and module connectivity.
- `graphify-out/graph.html`: Standalone interactive visualization viewable in any browser.
- `graphify-out/manifest.json`: Incremental extraction state.

### Automated CI/CD Graph Updates on PR Merge
Defined in `.github/workflows/graphify-update.yml`:
- Triggers on direct pushes to `main` affecting `src/**`, `package.json`, `index.ts`, `App.tsx`, or `tsconfig.json`.
- Runs deterministic AST extraction, clusters nodes, and exports `graph.html`.
- Commits and pushes updated graph deliverables back to `main` with `[skip ci]`.
- Transient cache directories (`graphify-out/cache/` and `graphify-out/.graphify_*`) are excluded via `.gitignore`.

---

## 3. GitHub Actions Continuous Integration (CI)

The CI pipeline is defined in `.github/workflows/ci.yml` and triggers automatically on:
- Pull requests targeting `main`.
- Direct pushes to `main`.

### Pipeline Stages
1. **Checkout Repository:** Checks out code using `actions/checkout@v4`.
2. **Environment Setup:** Configures Node.js runtime `22` with cached `npm` dependencies (`actions/setup-node@v4`).
3. **Deterministic Dependency Installation:** Runs `npm ci` honoring `package-lock.json`.
4. **Static Typecheck:** Runs `npm run typecheck` (`tsc --noEmit`) to enforce strict TypeScript compliance.
5. **Automated Test Suite:** Runs `npm test -- --ci --maxWorkers=2` to execute all Jest test suites.
   *(Test Suite Snapshot as of November 2026: 25 test suites, 232 tests passing cleanly).*
6. **Expo Dependency Compatibility:** Runs `npx expo install --check` to verify core packages match Expo SDK 58 recommendations.
7. **Expo Doctor Diagnostics:** Runs `npx expo-doctor` to ensure native manifest and plugin configuration health.
8. **Android Bundle Export:** Runs `npx expo export --platform android` with `EXPO_PUBLIC_API_URL: http://localhost:4000` to validate Hermes bundle compilation.
9. **Dependency Security Advisory Audit:** Runs `npm audit --audit-level=high` (marked `continue-on-error: true` for build-time developer dependencies).

---

## 4. Dependabot & Security Automation

Configured in `.github/dependabot.yml`:
- **Ecosystem:** `npm`
- **Schedule:** Weekly updates (Mondays at 06:00 UTC).
- **Grouped Updates:** Minor and patch updates for routine developer tooling (`@types/*`, `jest`, `typescript`, `@testing-library/*`) are grouped into a single consolidated PR to prevent notification fatigue.
- **Expo SDK Alignment Notice:** Packages under `expo`, `react-native`, `react`, and `expo-*` require manual compatibility verification (`npx expo install --check` and `npx expo-doctor`) before merging.
