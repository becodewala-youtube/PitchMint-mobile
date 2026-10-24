# Graph Report - PitchMint-mobile  (2026-10-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 500 nodes · 1296 edges · 18 communities (16 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fa0928d8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react-native
- IdeaDetailsScreen.tsx
- apiClient.ts
- ResetPasswordScreen.tsx
- RootNavigator.tsx
- steps
- graphify-update.yml
- expo
- package.json
- updates
- ActivityScreen.tsx
- scripts
- dependencies
- GoogleSignInButton.tsx
- app/App.tsx
- tsconfig.json
- AppErrorBoundary

## God Nodes (most connected - your core abstractions)
1. `react-native` - 46 edges
2. `react` - 45 edges
3. `Icon()` - 21 edges
4. `ApiError` - 19 edges
5. `useAuth()` - 18 edges
6. `@react-navigation/native` - 17 edges
7. `Colors` - 14 edges
8. `Button()` - 13 edges
9. `@react-navigation/native-stack` - 13 edges
10. `expo` - 13 edges

## Surprising Connections (you probably didn't know these)
- `BadgeProps` --references--> `Tone`  [EXTRACTED]
  src/components/Badge.tsx → src/theme/colors.ts
- `InputProps` --references--> `IconName`  [EXTRACTED]
  src/components/Input.tsx → src/components/Icon.tsx
- `PillProps` --references--> `Tone`  [EXTRACTED]
  src/components/Pill.tsx → src/theme/colors.ts
- `AuthNavigatorProps` --references--> `AuthStackParamList`  [EXTRACTED]
  src/navigation/AuthNavigator.tsx → src/navigation/types.ts
- `ActivityScreen()` --calls--> `formatDisplayDateTime()`  [EXTRACTED]
  src/features/activity/screens/ActivityScreen.tsx → src/utils/date.ts

## Import Cycles
- None detected.

## Communities (18 total, 2 thin omitted)

### Community 0 - "react-native"
Cohesion: 0.06
Nodes (59): react, react-native, react-native-safe-area-context, AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles, AuthCardProps (+51 more)

### Community 1 - "IdeaDetailsScreen.tsx"
Cohesion: 0.05
Nodes (51): AppConfig, config, HomeScreen(), NavigationProp, styles, mockNavigate, mockRefreshUser, mockUser (+43 more)

### Community 2 - "apiClient.ts"
Cohesion: 0.07
Nodes (39): RFC-4122, AuthContextType, AuthProvider(), mockUser, mockClearError, mockNavigate, mockRouteParams, mockSignIn (+31 more)

### Community 3 - "ResetPasswordScreen.tsx"
Cohesion: 0.13
Nodes (38): @react-navigation/native, @react-navigation/native-stack, AuthCard(), Button(), GoogleSignInButton(), Icon(), Input(), useAuth() (+30 more)

### Community 4 - "RootNavigator.tsx"
Cohesion: 0.09
Nodes (23): expo-secure-store, AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider(), useOnboarding(), AuthLoadingScreen(), OnboardingScreen() (+15 more)

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

### Community 10 - "ActivityScreen.tsx"
Cohesion: 0.27
Nodes (11): Card(), IconBadge(), Pill(), ScreenContainer(), ActivityScreen(), getServiceVisuals(), styles, activityApi (+3 more)

### Community 11 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+4 more)

### Community 12 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, expo-secure-store@~57.0.4, react@19.2.3, react-native@0.86.3, react-native-safe-area-context@~5.7.0, react-native-screens@~4.26.0, @react-navigation/bottom-tabs@^7.20.0, @react-navigation/native@^7.5.0 (+3 more)

### Community 13 - "GoogleSignInButton.tsx"
Cohesion: 0.24
Nodes (8): GoogleLogo(), GoogleSignInButtonProps, styles, AuthSuccessResponse, checkGoogleSignInStatus(), googleAuthService, GoogleSignInConfig, GoogleSignInStatus

### Community 14 - "app/App.tsx"
Cohesion: 0.24
Nodes (7): expo@~57.0.31, expo-status-bar@~57.0.1, expo, expo-status-bar, App(), AppProviders(), navigationDarkTheme

### Community 15 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

## Knowledge Gaps
- **2 isolated node(s):** `expo/tsconfig.base`, `RFC-4122`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 221 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `IdeaDetailsScreen.tsx`, `apiClient.ts`, `ResetPasswordScreen.tsx`, `RootNavigator.tsx`, `package.json`, `ActivityScreen.tsx`, `dependencies`, `GoogleSignInButton.tsx`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base`, `RFC-4122` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `react-native` be split into smaller, more focused modules?**
  _Cohesion score 0.05701754385964912 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react-native` to `IdeaDetailsScreen.tsx`, `apiClient.ts`, `ResetPasswordScreen.tsx`, `RootNavigator.tsx`, `package.json`, `ActivityScreen.tsx`, `dependencies`, `GoogleSignInButton.tsx`, `app/App.tsx`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **Should `IdeaDetailsScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.054746835443037975 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Should `apiClient.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06779661016949153 - nodes in this community are weakly interconnected._