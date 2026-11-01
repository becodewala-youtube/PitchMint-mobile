# Graph Report - PitchMint-mobile  (2026-11-01)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 543 nodes · 1454 edges · 18 communities (16 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a938172a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- IdeaDetailsScreen.tsx
- react-native
- apiClient.ts
- ResetPasswordScreen.tsx
- RootNavigator.tsx
- expo
- ProfileScreen.tsx
- steps
- graphify-update.yml
- package.json
- updates
- ActivityScreen.tsx
- dependencies
- scripts
- tsconfig.json
- AppErrorBoundary
- App.tsx

## God Nodes (most connected - your core abstractions)
1. `react-native` - 51 edges
2. `react` - 49 edges
3. `Icon()` - 25 edges
4. `useAuth()` - 24 edges
5. `ApiError` - 23 edges
6. `@react-navigation/native` - 19 edges
7. `ideasApi` - 16 edges
8. `expo` - 15 edges
9. `Button()` - 14 edges
10. `react-test-renderer` - 14 edges

## Surprising Connections (you probably didn't know these)
- `ChatVisual()` --calls--> `Icon()`  [EXTRACTED]
  src/features/onboarding/screens/OnboardingScreen.tsx → src/components/Icon.tsx
- `DeckVisual()` --calls--> `Icon()`  [EXTRACTED]
  src/features/onboarding/screens/OnboardingScreen.tsx → src/components/Icon.tsx
- `StackVisual()` --calls--> `Icon()`  [EXTRACTED]
  src/features/onboarding/screens/OnboardingScreen.tsx → src/components/Icon.tsx
- `BadgeProps` --references--> `Tone`  [EXTRACTED]
  src/components/Badge.tsx → src/theme/colors.ts
- `InputProps` --references--> `IconName`  [EXTRACTED]
  src/components/Input.tsx → src/components/Icon.tsx

## Import Cycles
- None detected.

## Communities (18 total, 2 thin omitted)

### Community 0 - "IdeaDetailsScreen.tsx"
Cohesion: 0.06
Nodes (64): useAuth(), CANVAS_BLOCK_DEFINITIONS, CanvasBlockDefinition, CanvasScreen(), formatCanvasAsMarkdown(), styles, mockGoBack, mockNavigate (+56 more)

### Community 1 - "react-native"
Cohesion: 0.07
Nodes (53): react, react-native, react-native-safe-area-context, AppProviders(), AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles (+45 more)

### Community 2 - "apiClient.ts"
Cohesion: 0.06
Nodes (42): RFC-4122, GoogleLogo(), GoogleSignInButtonProps, styles, AuthContextType, AuthProvider(), mockUser, mockGoBack (+34 more)

### Community 3 - "ResetPasswordScreen.tsx"
Cohesion: 0.10
Nodes (45): @react-navigation/native, @react-navigation/native-stack, AuthCard(), Button(), GoogleSignInButton(), Icon(), Input(), useOnboarding() (+37 more)

### Community 4 - "RootNavigator.tsx"
Cohesion: 0.06
Nodes (29): expo-secure-store, AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider(), AuthLoadingScreen(), BARS, ChatVisual() (+21 more)

### Community 5 - "expo"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, projectId (+18 more)

### Community 6 - "ProfileScreen.tsx"
Cohesion: 0.11
Nodes (16): { withAndroidManifest }, AppConfig, config, DEFAULT_API_URL, getAppConfig(), getDefaultApiUrl(), isDemoTopUpEnabled(), sanitizeApiUrl() (+8 more)

### Community 7 - "steps"
Cohesion: 0.08
Nodes (23): concurrency, cancel-in-progress, group, EXPO_PUBLIC_API_URL, jobs, validate, name, on (+15 more)

### Community 8 - "graphify-update.yml"
Cohesion: 0.08
Nodes (23): concurrency, cancel-in-progress, group, jobs, update-graph, name, permissions, contents (+15 more)

### Community 9 - "package.json"
Cohesion: 0.12
Nodes (23): devDependencies, jest@~30.5.2, jest-expo@~58.0.13, react-test-renderer@^19.3.0, @testing-library/react-native@^14.1.0, @types/jest@30.0.0, @types/node@^26.6.5, @types/react@~19.3.0 (+15 more)

### Community 10 - "updates"
Cohesion: 0.12
Nodes (15): prefix, patterns, development-dependencies, day, interval, time, timezone, updates (+7 more)

### Community 11 - "ActivityScreen.tsx"
Cohesion: 0.27
Nodes (11): Card(), IconBadge(), Pill(), ScreenContainer(), ActivityScreen(), getServiceVisuals(), styles, activityApi (+3 more)

### Community 12 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, expo-secure-store@~58.0.2, expo-status-bar@~58.0.4, react@19.3.0, react-native@0.88.1, react-native-safe-area-context@~5.10.1, react-native-screens@~4.30.1, @react-navigation/bottom-tabs@^7.20.0 (+5 more)

### Community 13 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+4 more)

### Community 14 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

### Community 16 - "App.tsx"
Cohesion: 0.50
Nodes (3): expo@^58.0.22, expo, App()

## Knowledge Gaps
- **2 isolated node(s):** `expo/tsconfig.base`, `RFC-4122`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 237 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `IdeaDetailsScreen.tsx`, `apiClient.ts`, `ResetPasswordScreen.tsx`, `RootNavigator.tsx`, `ProfileScreen.tsx`, `package.json`, `ActivityScreen.tsx`, `dependencies`?**
  _High betweenness centrality (0.157) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base`, `RFC-4122` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `IdeaDetailsScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05586722767648434 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react-native` to `IdeaDetailsScreen.tsx`, `apiClient.ts`, `ResetPasswordScreen.tsx`, `RootNavigator.tsx`, `ProfileScreen.tsx`, `package.json`, `ActivityScreen.tsx`, `dependencies`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Should `react-native` be split into smaller, more focused modules?**
  _Cohesion score 0.06621067031463748 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Should `apiClient.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06284153005464481 - nodes in this community are weakly interconnected._