# Graph Report - PitchMint-mobile  (2026-10-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 469 nodes · 1221 edges · 16 communities (14 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1297f0c2`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- theme/index.ts
- HomeScreen.tsx
- AuthContext.tsx
- Icon
- BottomTabNavigator.tsx
- steps
- graphify-update.yml
- expo
- package.json
- updates
- dependencies
- scripts
- tsconfig.json
- AppErrorBoundary
- App.tsx

## God Nodes (most connected - your core abstractions)
1. `react-native` - 43 edges
2. `react` - 42 edges
3. `Icon()` - 29 edges
4. `Colors` - 18 edges
5. `useAuth()` - 16 edges
6. `@react-navigation/native` - 16 edges
7. `Button()` - 14 edges
8. `typography` - 14 edges
9. `HomeScreen()` - 13 edges
10. `borderRadius` - 13 edges

## Surprising Connections (you probably didn't know these)
- `SettingRowProps` --references--> `IconName`  [EXTRACTED]
  src/features/profile/screens/ProfileScreen.tsx → src/components/Icon.tsx
- `BadgeProps` --references--> `Tone`  [EXTRACTED]
  src/components/Badge.tsx → src/theme/colors.ts
- `PillProps` --references--> `Tone`  [EXTRACTED]
  src/components/Pill.tsx → src/theme/colors.ts
- `InputProps` --references--> `IconName`  [EXTRACTED]
  src/components/Input.tsx → src/components/Icon.tsx
- `AuthNavigatorProps` --references--> `AuthStackParamList`  [EXTRACTED]
  src/navigation/AuthNavigator.tsx → src/navigation/types.ts

## Import Cycles
- None detected.

## Communities (16 total, 2 thin omitted)

### Community 0 - "theme/index.ts"
Cohesion: 0.06
Nodes (59): react, react-native, react-native-safe-area-context, AppProviders(), AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles (+51 more)

### Community 1 - "HomeScreen.tsx"
Cohesion: 0.08
Nodes (45): Card(), IconBadge(), Pill(), getScoreColor(), ScoreRing(), ScreenContainer(), SectionHeader(), ActivityScreen() (+37 more)

### Community 2 - "AuthContext.tsx"
Cohesion: 0.07
Nodes (36): RFC-4122, GoogleLogo(), GoogleSignInButtonProps, styles, AppConfig, config, AuthContextType, AuthProvider() (+28 more)

### Community 3 - "Icon"
Cohesion: 0.12
Nodes (41): @react-navigation/native, @react-navigation/native-stack, AuthCard(), Button(), GoogleSignInButton(), Icon(), Input(), useAuth() (+33 more)

### Community 4 - "BottomTabNavigator.tsx"
Cohesion: 0.07
Nodes (31): expo-secure-store, @react-navigation/bottom-tabs, AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider(), useOnboarding(), AuthLoadingScreen() (+23 more)

### Community 5 - "steps"
Cohesion: 0.08
Nodes (23): concurrency, cancel-in-progress, group, EXPO_PUBLIC_API_URL, jobs, validate, name, branches (+15 more)

### Community 6 - "graphify-update.yml"
Cohesion: 0.08
Nodes (23): concurrency, cancel-in-progress, group, jobs, update-graph, name, permissions, contents (+15 more)

### Community 7 - "expo"
Cohesion: 0.09
Nodes (21): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+13 more)

### Community 8 - "package.json"
Cohesion: 0.13
Nodes (21): devDependencies, jest@^29.7.0, jest-expo@^57.0.6, @testing-library/react-native@^14.1.0, @types/jest@^29.5.14, @types/node@^26.6.5, @types/react@~19.2.2, @types/react-test-renderer@^19.3.0 (+13 more)

### Community 9 - "updates"
Cohesion: 0.12
Nodes (15): prefix, patterns, development-dependencies, day, interval, time, timezone, updates (+7 more)

### Community 10 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, expo-secure-store@~57.0.4, expo-status-bar@~57.0.1, react@19.2.3, react-native@0.86.3, react-native-safe-area-context@~5.7.0, react-native-screens@~4.26.0, @react-navigation/bottom-tabs@^7.20.0 (+4 more)

### Community 11 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+4 more)

### Community 12 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

### Community 14 - "App.tsx"
Cohesion: 0.50
Nodes (3): expo@~57.0.31, expo, App()

## Knowledge Gaps
- **2 isolated node(s):** `expo/tsconfig.base`, `RFC-4122`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 200 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `theme/index.ts` to `HomeScreen.tsx`, `AuthContext.tsx`, `Icon`, `BottomTabNavigator.tsx`, `package.json`, `dependencies`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base`, `RFC-4122` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `theme/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.061142217245240764 - nodes in this community are weakly interconnected._
- **Why does `react` connect `theme/index.ts` to `HomeScreen.tsx`, `AuthContext.tsx`, `Icon`, `BottomTabNavigator.tsx`, `package.json`, `dependencies`?**
  _High betweenness centrality (0.102) - this node is a cross-community bridge._
- **Should `HomeScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07507914970601538 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Should `AuthContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06578947368421052 - nodes in this community are weakly interconnected._