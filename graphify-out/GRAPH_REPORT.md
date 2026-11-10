# Graph Report - PitchMint-mobile  (2026-11-10)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 554 nodes · 1471 edges · 26 communities (24 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6eab8f38`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react-native
- apiClient.ts
- SignInScreen.tsx
- RootNavigator.tsx
- expo
- steps
- graphify-update.yml
- package.json
- IdeaDetailsScreen.tsx
- updates
- HomeScreen.tsx
- env.ts
- ActivityScreen.tsx
- @react-navigation/native
- ValidateModalScreen.tsx
- CanvasScreen.tsx
- scripts
- PitchDeckScreen.tsx
- ProfileScreen.tsx
- IdeasScreen.tsx
- googleAuthService.ts
- tsconfig.json
- AppErrorBoundary
- parseIdeaTitleAndDesc
- App.tsx

## God Nodes (most connected - your core abstractions)
1. `react-native` - 52 edges
2. `react` - 49 edges
3. `useAuth()` - 24 edges
4. `ApiError` - 23 edges
5. `Icon()` - 20 edges
6. `@react-navigation/native` - 19 edges
7. `ideasApi` - 16 edges
8. `expo` - 15 edges
9. `react-test-renderer` - 14 edges
10. `TokenStorageError` - 13 edges

## Surprising Connections (you probably didn't know these)
- `HomeScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/home/screens/HomeScreen.tsx → src/services/api/ideasApi.ts
- `IdeasScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/ideas/screens/IdeasScreen.tsx → src/services/api/ideasApi.ts
- `ChatVisual()` --calls--> `Icon()`  [EXTRACTED]
  src/features/onboarding/screens/OnboardingScreen.tsx → src/components/Icon.tsx
- `DeckVisual()` --calls--> `Icon()`  [EXTRACTED]
  src/features/onboarding/screens/OnboardingScreen.tsx → src/components/Icon.tsx
- `StackVisual()` --calls--> `Icon()`  [EXTRACTED]
  src/features/onboarding/screens/OnboardingScreen.tsx → src/components/Icon.tsx

## Import Cycles
- None detected.

## Communities (26 total, 2 thin omitted)

### Community 0 - "react-native"
Cohesion: 0.06
Nodes (57): react-native-safe-area-context@~5.11.1, react, react-native, react-native-safe-area-context, AppProviders(), AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState (+49 more)

### Community 1 - "apiClient.ts"
Cohesion: 0.06
Nodes (48): RFC-4122, react-test-renderer, config, AuthContextType, AuthProvider(), logAuthWarning(), mockUser, mockClearError (+40 more)

### Community 2 - "SignInScreen.tsx"
Cohesion: 0.10
Nodes (37): @react-navigation/native-stack, AuthCard(), Button(), GoogleLogo(), GoogleSignInButton(), Icon(), Input(), useAuth() (+29 more)

### Community 3 - "RootNavigator.tsx"
Cohesion: 0.07
Nodes (29): expo-secure-store, AuthContext, OnboardingContext, OnboardingContextType, useOnboarding(), AuthLoadingScreen(), BARS, ChatVisual() (+21 more)

### Community 4 - "expo"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, projectId (+18 more)

### Community 5 - "steps"
Cohesion: 0.08
Nodes (23): concurrency, cancel-in-progress, group, EXPO_PUBLIC_API_URL, jobs, validate, name, on (+15 more)

### Community 6 - "graphify-update.yml"
Cohesion: 0.08
Nodes (23): concurrency, cancel-in-progress, group, jobs, update-graph, name, permissions, contents (+15 more)

### Community 7 - "package.json"
Cohesion: 0.12
Nodes (22): devDependencies, jest@~30.5.2, jest-expo@~58.0.14, react-test-renderer@^19.3.0, @testing-library/react-native@^14.1.0, @types/jest@30.0.0, @types/node@^26.6.5, @types/react@~19.3.0 (+14 more)

### Community 8 - "IdeaDetailsScreen.tsx"
Cohesion: 0.15
Nodes (17): CANVAS_BLOCKS, PITCH_DECK_SLIDES, styles, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams, BackendIdea (+9 more)

### Community 9 - "updates"
Cohesion: 0.12
Nodes (15): prefix, patterns, development-dependencies, day, interval, time, timezone, updates (+7 more)

### Community 10 - "HomeScreen.tsx"
Cohesion: 0.19
Nodes (10): HomeScreen(), NavigationProp, styles, mockNavigate, mockRefreshUser, mockUser, formatDisplayDate(), formatDisplayDateTime() (+2 more)

### Community 11 - "env.ts"
Cohesion: 0.18
Nodes (7): { withAndroidManifest }, AppConfig, DEFAULT_API_URL, getAppConfig(), getDefaultApiUrl(), isDemoTopUpEnabled(), sanitizeApiUrl()

### Community 12 - "ActivityScreen.tsx"
Cohesion: 0.27
Nodes (11): Card(), IconBadge(), Pill(), ScreenContainer(), ActivityScreen(), getServiceVisuals(), styles, activityApi (+3 more)

### Community 13 - "@react-navigation/native"
Cohesion: 0.14
Nodes (14): dependencies, expo-clipboard@~58.0.4, expo-secure-store@~58.0.2, expo-status-bar@~58.0.4, react@19.3.0, react-native@0.88.1, react-native-screens@~4.30.1, @react-navigation/bottom-tabs@^7.20.0 (+6 more)

### Community 14 - "ValidateModalScreen.tsx"
Cohesion: 0.15
Nodes (9): ANALYZING_STEPS, ModalStage, styles, TIPS, AuthStackNavigationProp, MainTabNavigationProp, MainTabParamList, RootStackNavigationProp (+1 more)

### Community 15 - "CanvasScreen.tsx"
Cohesion: 0.23
Nodes (11): expo-clipboard, CANVAS_BLOCK_DEFINITIONS, CanvasBlockDefinition, CanvasScreen(), formatCanvasAsMarkdown(), styles, mockGoBack, mockNavigate (+3 more)

### Community 16 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+4 more)

### Community 17 - "PitchDeckScreen.tsx"
Cohesion: 0.26
Nodes (9): PitchDeckScreen(), SLIDE_DEFINITIONS, SlideDefinition, styles, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+1 more)

### Community 18 - "ProfileScreen.tsx"
Cohesion: 0.22
Nodes (5): DEMO_PLANS, ProfileScreen(), SettingRow(), SettingRowProps, styles

### Community 19 - "IdeasScreen.tsx"
Cohesion: 0.24
Nodes (6): FilterType, IdeasScreen(), NavigationProp, styles, mockNavigate, ideasApi

### Community 20 - "googleAuthService.ts"
Cohesion: 0.38
Nodes (5): AuthSuccessResponse, checkGoogleSignInStatus(), googleAuthService, GoogleSignInConfig, GoogleSignInStatus

### Community 21 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

### Community 23 - "parseIdeaTitleAndDesc"
Cohesion: 0.60
Nodes (4): IdeaDetailsScreen(), mapBackendIdeaToCard(), hasSubDocument(), parseIdeaTitleAndDesc()

### Community 24 - "App.tsx"
Cohesion: 0.50
Nodes (3): expo@~58.0.23, expo, App()

## Knowledge Gaps
- **2 isolated node(s):** `RFC-4122`, `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 242 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `apiClient.ts`, `SignInScreen.tsx`, `RootNavigator.tsx`, `package.json`, `IdeaDetailsScreen.tsx`, `HomeScreen.tsx`, `env.ts`, `ActivityScreen.tsx`, `@react-navigation/native`, `ValidateModalScreen.tsx`, `CanvasScreen.tsx`, `PitchDeckScreen.tsx`, `ProfileScreen.tsx`, `IdeasScreen.tsx`, `googleAuthService.ts`?**
  _High betweenness centrality (0.155) - this node is a cross-community bridge._
- **What connects `RFC-4122`, `expo/tsconfig.base` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `react-native` be split into smaller, more focused modules?**
  _Cohesion score 0.05972288580984233 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react-native` to `apiClient.ts`, `SignInScreen.tsx`, `RootNavigator.tsx`, `package.json`, `IdeaDetailsScreen.tsx`, `HomeScreen.tsx`, `ActivityScreen.tsx`, `@react-navigation/native`, `ValidateModalScreen.tsx`, `CanvasScreen.tsx`, `PitchDeckScreen.tsx`, `ProfileScreen.tsx`, `IdeasScreen.tsx`?**
  _High betweenness centrality (0.100) - this node is a cross-community bridge._
- **Should `apiClient.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05962732919254658 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Should `SignInScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10448979591836735 - nodes in this community are weakly interconnected._