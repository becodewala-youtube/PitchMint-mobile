# Graph Report - PitchMint-mobile  (2026-11-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 587 nodes · 1607 edges · 19 communities (17 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `405c5aaa`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- IdeaDetailsScreen.tsx
- apiClient.ts
- react-native
- RootNavigator.tsx
- with
- ResetPasswordScreen.tsx
- BottomTabNavigator.tsx
- expo
- steps
- package.json
- updates
- env.ts
- dependencies
- scripts
- GoogleSignInButton.tsx
- app/App.tsx
- tsconfig.json
- AppErrorBoundary

## God Nodes (most connected - your core abstractions)
1. `react-native` - 55 edges
2. `react` - 51 edges
3. `Icon()` - 28 edges
4. `useAuth()` - 24 edges
5. `ApiError` - 23 edges
6. `Button()` - 20 edges
7. `@react-navigation/native` - 19 edges
8. `IdeaDetailsScreen()` - 17 edges
9. `ideasApi` - 16 edges
10. `react-test-renderer` - 15 edges

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

## Communities (19 total, 2 thin omitted)

### Community 0 - "IdeaDetailsScreen.tsx"
Cohesion: 0.06
Nodes (68): react-test-renderer, Badge(), Button(), Card(), CreditConfirmationModal(), formatCreditValue(), IconBadge(), Pill() (+60 more)

### Community 1 - "apiClient.ts"
Cohesion: 0.05
Nodes (54): RFC-4122, AuthContextType, AuthProvider(), logAuthWarning(), mockUser, SignInNavigationProp, SignInRouteProp, SignInScreen() (+46 more)

### Community 2 - "react-native"
Cohesion: 0.08
Nodes (47): react, react-native, react-native-safe-area-context, AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles, AuthCardProps (+39 more)

### Community 3 - "RootNavigator.tsx"
Cohesion: 0.07
Nodes (32): expo-secure-store, AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider(), useOnboarding(), AuthLoadingScreen(), BARS (+24 more)

### Community 4 - "with"
Cohesion: 0.05
Nodes (46): if, name, needs, permissions, runs-on, steps, concurrency, cancel-in-progress (+38 more)

### Community 5 - "ResetPasswordScreen.tsx"
Cohesion: 0.13
Nodes (29): @react-navigation/native, @react-navigation/native-stack, AuthCard(), Icon(), Input(), EmailVerificationNavigationProp, EmailVerificationRouteProp, EmailVerificationScreen() (+21 more)

### Community 6 - "BottomTabNavigator.tsx"
Cohesion: 0.09
Nodes (22): @react-navigation/bottom-tabs, HomeScreen(), NavigationProp, styles, mockNavigate, mockRefreshUser, mockUser, FilterType (+14 more)

### Community 7 - "expo"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, projectId (+18 more)

### Community 8 - "steps"
Cohesion: 0.08
Nodes (26): concurrency, cancel-in-progress, group, EXPO_PUBLIC_API_URL, jobs, validate, name, on (+18 more)

### Community 9 - "package.json"
Cohesion: 0.12
Nodes (22): devDependencies, jest@~30.5.2, jest-expo@~58.0.14, react-test-renderer@^19.3.0, @testing-library/react-native@^14.1.0, @types/jest@30.0.0, @types/node@^26.6.5, @types/react@~19.3.0 (+14 more)

### Community 10 - "updates"
Cohesion: 0.12
Nodes (15): prefix, patterns, development-dependencies, day, interval, time, timezone, updates (+7 more)

### Community 11 - "env.ts"
Cohesion: 0.17
Nodes (8): { withAndroidManifest }, AppConfig, config, DEFAULT_API_URL, getAppConfig(), getDefaultApiUrl(), isDemoTopUpEnabled(), sanitizeApiUrl()

### Community 12 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, expo-clipboard@~58.0.4, expo-secure-store@~58.0.3, react@19.3.0, react-native@0.88.1, react-native-safe-area-context@~5.11.1, react-native-screens@~4.30.1, @react-navigation/bottom-tabs@^7.20.0 (+4 more)

### Community 13 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+4 more)

### Community 14 - "GoogleSignInButton.tsx"
Cohesion: 0.23
Nodes (9): GoogleLogo(), GoogleSignInButton(), GoogleSignInButtonProps, styles, AuthSuccessResponse, checkGoogleSignInStatus(), googleAuthService, GoogleSignInConfig (+1 more)

### Community 15 - "app/App.tsx"
Cohesion: 0.24
Nodes (7): expo@~58.0.25, expo-status-bar@~58.0.5, expo, expo-status-bar, App(), AppProviders(), navigationDarkTheme

### Community 16 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

## Knowledge Gaps
- **2 isolated node(s):** `RFC-4122`, `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 253 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `IdeaDetailsScreen.tsx`, `apiClient.ts`, `RootNavigator.tsx`, `ResetPasswordScreen.tsx`, `BottomTabNavigator.tsx`, `package.json`, `env.ts`, `dependencies`, `GoogleSignInButton.tsx`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **What connects `RFC-4122`, `expo/tsconfig.base` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `IdeaDetailsScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06222832303820636 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react-native` to `IdeaDetailsScreen.tsx`, `apiClient.ts`, `RootNavigator.tsx`, `ResetPasswordScreen.tsx`, `BottomTabNavigator.tsx`, `package.json`, `dependencies`, `GoogleSignInButton.tsx`, `app/App.tsx`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Should `apiClient.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05221518987341772 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `react-native` be split into smaller, more focused modules?**
  _Cohesion score 0.07963963963963964 - nodes in this community are weakly interconnected._