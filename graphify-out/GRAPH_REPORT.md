# Graph Report - PitchMint-mobile  (2026-10-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 507 nodes · 1308 edges · 21 communities (18 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1e7ff972`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react-native
- BottomTabNavigator.tsx
- package.json
- ResetPasswordScreen.tsx
- apiClient.ts
- steps
- graphify-update.yml
- expo
- IdeaDetailsScreen.tsx
- HomeScreen.tsx
- ProfileScreen.tsx
- updates
- ActivityScreen.tsx
- ValidateModalScreen.tsx
- IdeaDetailsScreen.test.tsx
- env.ts
- tsconfig.json
- AppErrorBoundary
- signInScreen.test.tsx

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
- `RootNavigator()` --calls--> `useAuth()`  [EXTRACTED]
  src/navigation/RootNavigator.tsx → src/context/AuthContext.tsx

## Import Cycles
- None detected.

## Communities (21 total, 3 thin omitted)

### Community 0 - "react-native"
Cohesion: 0.06
Nodes (53): react, react-native, AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles, AuthCardProps, styles (+45 more)

### Community 1 - "BottomTabNavigator.tsx"
Cohesion: 0.06
Nodes (30): expo-secure-store@~57.0.4, expo-secure-store, App(), AppProviders(), AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider() (+22 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (48): dependencies, expo@~57.0.31, expo-status-bar@~57.0.1, react@19.2.3, react-native@0.86.3, react-native-safe-area-context@~5.7.0, react-native-screens@~4.26.0, @react-navigation/bottom-tabs@^7.20.0 (+40 more)

### Community 3 - "ResetPasswordScreen.tsx"
Cohesion: 0.13
Nodes (38): @react-navigation/native, @react-navigation/native-stack, AuthCard(), Button(), GoogleSignInButton(), Icon(), Input(), useAuth() (+30 more)

### Community 4 - "apiClient.ts"
Cohesion: 0.08
Nodes (32): RFC-4122, GoogleLogo(), GoogleSignInButtonProps, styles, AuthContextType, AuthProvider(), mockUser, generateRequestId() (+24 more)

### Community 5 - "steps"
Cohesion: 0.08
Nodes (23): concurrency, cancel-in-progress, group, EXPO_PUBLIC_API_URL, jobs, validate, name, branches (+15 more)

### Community 6 - "graphify-update.yml"
Cohesion: 0.08
Nodes (23): concurrency, cancel-in-progress, group, jobs, update-graph, name, permissions, contents (+15 more)

### Community 7 - "expo"
Cohesion: 0.09
Nodes (22): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, expo (+14 more)

### Community 8 - "IdeaDetailsScreen.tsx"
Cohesion: 0.15
Nodes (17): CANVAS_BLOCKS, IdeaDetailsScreen(), PITCH_DECK_SLIDES, styles, BackendIdea, CanvasContentData, CompetitorItem, CompetitorSwot (+9 more)

### Community 9 - "HomeScreen.tsx"
Cohesion: 0.16
Nodes (12): HomeScreen(), NavigationProp, styles, FilterType, IdeasScreen(), NavigationProp, styles, RootStackParamList (+4 more)

### Community 10 - "ProfileScreen.tsx"
Cohesion: 0.13
Nodes (15): DEMO_PLANS, ProfileScreen(), SettingRow(), SettingRowProps, styles, mockRefreshUser, mockSignOut, mockUser (+7 more)

### Community 11 - "updates"
Cohesion: 0.12
Nodes (15): prefix, patterns, development-dependencies, day, interval, time, timezone, updates (+7 more)

### Community 12 - "ActivityScreen.tsx"
Cohesion: 0.25
Nodes (12): Card(), IconBadge(), Pill(), ScreenContainer(), ActivityScreen(), getServiceVisuals(), styles, activityApi (+4 more)

### Community 13 - "ValidateModalScreen.tsx"
Cohesion: 0.17
Nodes (9): ANALYZING_STEPS, ModalStage, styles, TIPS, ValidateModalScreen(), mockGoBack, mockNavigate, mockRefreshUser (+1 more)

### Community 14 - "IdeaDetailsScreen.test.tsx"
Cohesion: 0.20
Nodes (8): mockNavigate, mockRefreshUser, mockUser, mockGoBack, mockNavigate, mockRouteParams, mockNavigate, ideasApi

### Community 15 - "env.ts"
Cohesion: 0.39
Nodes (6): AppConfig, config, getAppConfig(), getDefaultApiUrl(), isDemoTopUpEnabled(), sanitizeApiUrl()

### Community 16 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

### Community 18 - "signInScreen.test.tsx"
Cohesion: 0.40
Nodes (4): mockClearError, mockNavigate, mockRouteParams, mockSignIn

## Knowledge Gaps
- **2 isolated node(s):** `expo/tsconfig.base`, `RFC-4122`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 222 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `BottomTabNavigator.tsx`, `package.json`, `ResetPasswordScreen.tsx`, `apiClient.ts`, `IdeaDetailsScreen.tsx`, `HomeScreen.tsx`, `ProfileScreen.tsx`, `ActivityScreen.tsx`, `ValidateModalScreen.tsx`, `IdeaDetailsScreen.test.tsx`, `env.ts`, `signInScreen.test.tsx`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base`, `RFC-4122` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `react-native` be split into smaller, more focused modules?**
  _Cohesion score 0.06429548563611491 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react-native` to `BottomTabNavigator.tsx`, `package.json`, `ResetPasswordScreen.tsx`, `apiClient.ts`, `IdeaDetailsScreen.tsx`, `HomeScreen.tsx`, `ProfileScreen.tsx`, `ActivityScreen.tsx`, `ValidateModalScreen.tsx`, `IdeaDetailsScreen.test.tsx`, `signInScreen.test.tsx`?**
  _High betweenness centrality (0.105) - this node is a cross-community bridge._
- **Should `BottomTabNavigator.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06196078431372549 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05187074829931973 - nodes in this community are weakly interconnected._
- **Should `ResetPasswordScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1347517730496454 - nodes in this community are weakly interconnected._