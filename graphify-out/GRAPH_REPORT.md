# Graph Report - PitchMint-mobile  (2026-11-01)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 524 nodes · 1379 edges · 19 communities (16 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fd8f2a57`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react-native
- IdeaDetailsScreen.tsx
- ResetPasswordScreen.tsx
- apiClient.ts
- RootNavigator.tsx
- expo
- steps
- graphify-update.yml
- ProfileScreen.tsx
- package.json
- updates
- ActivityScreen.tsx
- scripts
- dependencies
- app/App.tsx
- tsconfig.json
- AppErrorBoundary

## God Nodes (most connected - your core abstractions)
1. `react-native` - 48 edges
2. `react` - 47 edges
3. `useAuth()` - 22 edges
4. `ApiError` - 21 edges
5. `Icon()` - 21 edges
6. `@react-navigation/native` - 18 edges
7. `expo` - 15 edges
8. `Colors` - 14 edges
9. `ideasApi` - 14 edges
10. `Button()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `BadgeProps` --references--> `Tone`  [EXTRACTED]
  src/components/Badge.tsx → src/theme/colors.ts
- `InputProps` --references--> `IconName`  [EXTRACTED]
  src/components/Input.tsx → src/components/Icon.tsx
- `PillProps` --references--> `Tone`  [EXTRACTED]
  src/components/Pill.tsx → src/theme/colors.ts
- `AuthNavigatorProps` --references--> `AuthStackParamList`  [EXTRACTED]
  src/navigation/AuthNavigator.tsx → src/navigation/types.ts
- `HomeScreen()` --calls--> `useAuth()`  [EXTRACTED]
  src/features/home/screens/HomeScreen.tsx → src/context/AuthContext.tsx

## Import Cycles
- None detected.

## Communities (19 total, 3 thin omitted)

### Community 0 - "react-native"
Cohesion: 0.06
Nodes (61): react, react-native, react-native-safe-area-context, AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles, AuthCardProps (+53 more)

### Community 1 - "IdeaDetailsScreen.tsx"
Cohesion: 0.06
Nodes (54): HomeScreen(), NavigationProp, styles, mockNavigate, mockRefreshUser, mockUser, CANVAS_BLOCKS, IdeaDetailsScreen() (+46 more)

### Community 2 - "ResetPasswordScreen.tsx"
Cohesion: 0.11
Nodes (44): @react-navigation/native, @react-navigation/native-stack, AuthCard(), Button(), GoogleLogo(), GoogleSignInButton(), Icon(), Input() (+36 more)

### Community 3 - "apiClient.ts"
Cohesion: 0.07
Nodes (35): RFC-4122, AuthContextType, AuthProvider(), mockUser, apiClient, generateRequestId(), RequestOptions, setUnauthorizedHandler() (+27 more)

### Community 4 - "RootNavigator.tsx"
Cohesion: 0.09
Nodes (23): expo-secure-store, AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider(), useOnboarding(), AuthLoadingScreen(), OnboardingScreen() (+15 more)

### Community 5 - "expo"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, projectId (+18 more)

### Community 6 - "steps"
Cohesion: 0.08
Nodes (23): concurrency, cancel-in-progress, group, EXPO_PUBLIC_API_URL, jobs, validate, name, branches (+15 more)

### Community 7 - "graphify-update.yml"
Cohesion: 0.08
Nodes (23): concurrency, cancel-in-progress, group, jobs, update-graph, name, permissions, contents (+15 more)

### Community 8 - "ProfileScreen.tsx"
Cohesion: 0.13
Nodes (15): AppConfig, config, getAppConfig(), getDefaultApiUrl(), isDemoTopUpEnabled(), sanitizeApiUrl(), DEMO_PLANS, ProfileScreen() (+7 more)

### Community 9 - "package.json"
Cohesion: 0.13
Nodes (21): devDependencies, jest@^29.7.0, jest-expo@^57.0.6, @testing-library/react-native@^14.1.0, @types/jest@^29.5.14, @types/node@^26.6.5, @types/react@~19.2.2, @types/react-test-renderer@^19.3.0 (+13 more)

### Community 10 - "updates"
Cohesion: 0.12
Nodes (15): prefix, patterns, development-dependencies, day, interval, time, timezone, updates (+7 more)

### Community 11 - "ActivityScreen.tsx"
Cohesion: 0.27
Nodes (11): Card(), IconBadge(), Pill(), ScreenContainer(), ActivityScreen(), getServiceVisuals(), styles, activityApi (+3 more)

### Community 12 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+4 more)

### Community 13 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, expo-secure-store@~57.0.4, react@19.2.3, react-native@0.86.3, react-native-safe-area-context@~5.7.0, react-native-screens@~4.26.0, @react-navigation/bottom-tabs@^7.20.0, @react-navigation/native@^7.5.0 (+3 more)

### Community 14 - "app/App.tsx"
Cohesion: 0.24
Nodes (7): expo@~57.0.31, expo-status-bar@~57.0.1, expo, expo-status-bar, App(), AppProviders(), navigationDarkTheme

### Community 15 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

## Knowledge Gaps
- **2 isolated node(s):** `expo/tsconfig.base`, `RFC-4122`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 230 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `IdeaDetailsScreen.tsx`, `ResetPasswordScreen.tsx`, `apiClient.ts`, `RootNavigator.tsx`, `ProfileScreen.tsx`, `package.json`, `ActivityScreen.tsx`, `dependencies`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base`, `RFC-4122` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `react-native` be split into smaller, more focused modules?**
  _Cohesion score 0.055964653902798235 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react-native` to `IdeaDetailsScreen.tsx`, `ResetPasswordScreen.tsx`, `apiClient.ts`, `RootNavigator.tsx`, `ProfileScreen.tsx`, `package.json`, `ActivityScreen.tsx`, `dependencies`, `app/App.tsx`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Should `IdeaDetailsScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05907172995780591 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Should `ResetPasswordScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10779220779220779 - nodes in this community are weakly interconnected._