# PitchMint Mobile — Development Workflow & Tooling Guide

This guide details the development practices, automated checks, Graphify knowledge graph workflow, and CI/CD pipelines for `PitchMint-mobile`.

---

## 1. Local Development Commands

All commands should be executed from the root of `PitchMint-mobile`:

| Command | Purpose | When to Run |
| :--- | :--- | :--- |
| `npm run start` | Launch Expo development server | Active feature development |
| `npm run android` | Launch app on Android emulator/device | Native UI testing |
| `npm run typecheck` | Run TypeScript compiler (`tsc --noEmit`) | Pre-commit, every code change |
| `npm test` | Run Jest unit & integration tests | Pre-commit, every code change |
| `npm run doctor` | Run `npx expo-doctor` diagnostic checks | Dependency updates & pre-PR |
| `npx expo export --platform android` | Validate Android JS bundle bundling | Pre-PR and release verification |

---

## 2. Graphify Code Graph Workflow

Graphify produces a repository-local semantic and architectural graph of the codebase, assisting AI agents and developers in exploring relationships between modules.

### Prerequisites
- Python 3.10+ (Verified on Python 3.12.3)
- `graphifyy` package installed (`pip install graphifyy`)

### Generation Commands
To generate the code graph deterministically without requiring external LLM API keys or incurring token costs:

```bash
# Convenience npm script (runs extract, cluster, and html export)
npm run graphify:update

# Or run commands directly:
python -m graphify extract . --code-only
python -m graphify cluster-only .
python -m graphify export html
```

### Generated & Tracked Deliverables (`graphify-out/`)
- `graphify-out/graph.json`: Raw graph structure containing nodes, edges, and community clusters.
- `graphify-out/GRAPH_REPORT.md`: Architectural summary including god nodes, surprising connections, and suggested questions.
- `graphify-out/graph.html`: Standalone interactive visualization viewable in any web browser without a local server.
- `graphify-out/manifest.json`: Incremental extraction state.

### Automated CI/CD Graph Updates on PR Merge
- Defined in `.github/workflows/graphify-update.yml`.
- Whenever a PR is merged into `main` (push event on `main`), GitHub Actions automatically:
  1. Installs `graphifyy` in Python 3.12.
  2. Runs deterministic AST extraction and exports `graph.html`.
  3. Commits and pushes the updated graph deliverables (`graph.json`, `GRAPH_REPORT.md`, `graph.html`) back to `main` with `[skip ci]`.
- Internal cache directories (`graphify-out/cache/` and `graphify-out/.graphify_*`) are ignored in `.gitignore`.

---

## 3. GitHub Actions Continuous Integration (CI)

The CI workflow is defined in `.github/workflows/ci.yml` and triggers automatically on:
- Pull requests targeting `main`.
- Direct pushes to `main`.

### Pipeline Stages
1. **Checkout & Environment Setup:** Uses Node.js 20 with cached `npm` dependencies.
2. **Deterministic Install:** `npm ci` strictly honors `package-lock.json`.
3. **Static Typecheck:** `npm run typecheck` validates strict TypeScript compliance.
4. **Automated Test Suite:** `npm test -- --ci --maxWorkers=2` runs all 10 test suites (75 tests).
5. **Expo Diagnostics:** `npx expo-doctor` validates SDK version alignment and native configurations.
6. **Android Export Bundling:** `npx expo export --platform android` verifies Metro bundling to Hermes bytecode.
7. **Security Advisory Audit:** `npm audit` reports dependency vulnerabilities without failing the pipeline on non-exploitable build-time dev dependencies.

---

## 4. Dependabot & Security Automation

Configured in `.github/dependabot.yml`:
- **Ecosystem:** `npm`
- **Schedule:** Weekly updates (Mondays).
- **Grouped Updates:** Minor and patch updates for routine developer tooling (`@types/*`, `jest`, `typescript`, `@testing-library/*`) are grouped into a single consolidated PR to avoid review fatigue.
- **Expo & React Native Upgrades:** Expo SDK packages (`expo`, `react-native`, `react-native-screens`, `expo-secure-store`) require manual verification using `npx expo install --check` and `npx expo-doctor` to ensure SDK compatibility.
