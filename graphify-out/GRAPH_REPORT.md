# Graph Report - PitchMint-mobile  (2026-11-15)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 883 nodes · 2919 edges · 35 communities (31 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `caa163ea`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react-native
- Icon
- PitchDeckScreen.tsx
- RootNavigator.tsx
- with
- SignInScreen.tsx
- ideasApi.ts
- CanvasScreen.tsx
- react
- expo
- steps
- react-test-renderer
- AuthContext.tsx
- ApiError
- HomeScreen.tsx
- apiClient.ts
- tokenStorage.ts
- updates
- dependencies
- IdeaDetailsScreen.modules.test.tsx
- devDependencies
- IdeasScreen.tsx
- ActivityScreen.tsx
- scripts
- env.ts
- GoogleSignInButton.tsx
- package.json
- BottomTabNavigator.tsx
- PitchSimulatorScreen.test.tsx
- tsconfig.json
- AppErrorBoundary
- App.tsx
- withCleartextTraffic.js
- useValidateIdea.idempotency.test.tsx

## God Nodes (most connected - your core abstractions)
1. `react-native` - 126 edges
2. `react` - 108 edges
3. `Icon()` - 73 edges
4. `Card()` - 54 edges
5. `Button()` - 41 edges
6. `IconBadge()` - 41 edges
7. `react-test-renderer` - 35 edges
8. `ideasApi` - 32 edges
9. `ApiError` - 30 edges
10. `useAuth()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `TestHarness()` --calls--> `useCanvas()`  [EXTRACTED]
  src/features/canvas/hooks/__tests__/useCanvas.idempotency.test.tsx → src/features/canvas/hooks/useCanvas.ts
- `HomeScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/home/screens/HomeScreen.tsx → src/services/api/ideasApi.ts
- `IdeasScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/ideas/screens/IdeasScreen.tsx → src/services/api/ideasApi.ts
- `BadgeProps` --references--> `Tone`  [EXTRACTED]
  src/components/Badge.tsx → src/theme/colors.ts
- `PillProps` --references--> `Tone`  [EXTRACTED]
  src/components/Pill.tsx → src/theme/colors.ts

## Import Cycles
- None detected.

## Communities (35 total, 4 thin omitted)

### Community 0 - "react-native"
Cohesion: 0.06
Nodes (55): react-native, react-native-safe-area-context, AppProviders(), AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles, AuthCardProps (+47 more)

### Community 1 - "Icon"
Cohesion: 0.09
Nodes (61): Badge(), Button(), Card(), CreditConfirmationModal(), DeleteConfirmationModal(), Icon(), IconBadge(), IdeaCard() (+53 more)

### Community 2 - "PitchDeckScreen.tsx"
Cohesion: 0.06
Nodes (47): expo-file-system@~58.0.13, expo-print@~58.0.9, expo-sharing@~58.0.23, expo-file-system, expo-print, expo-sharing, PitchDeckSlideStrip(), PitchDeckSlideStripProps (+39 more)

### Community 3 - "RootNavigator.tsx"
Cohesion: 0.07
Nodes (31): expo-secure-store, AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider(), useOnboarding(), AuthLoadingScreen(), ChatVisual() (+23 more)

### Community 4 - "with"
Cohesion: 0.05
Nodes (46): if, name, needs, permissions, runs-on, steps, concurrency, cancel-in-progress (+38 more)

### Community 5 - "SignInScreen.tsx"
Cohesion: 0.11
Nodes (34): @react-navigation/native, @react-navigation/native-stack, AuthCard(), Input(), EmailVerificationNavigationProp, EmailVerificationRouteProp, EmailVerificationScreen(), styles (+26 more)

### Community 6 - "ideasApi.ts"
Cohesion: 0.10
Nodes (32): IdeaCardProps, CompetitorActionModuleProps, IdeaActionModulesProps, PitchSimulationActionModuleProps, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+24 more)

### Community 7 - "CanvasScreen.tsx"
Cohesion: 0.11
Nodes (21): expo-clipboard@~58.0.4, expo-clipboard, CanvasBlockSelector(), CanvasBlockSelectorProps, CanvasBlockViewerProps, CANVAS_BLOCK_DEFINITIONS, CanvasBlockDefinition, TestHarness() (+13 more)

### Community 8 - "react"
Cohesion: 0.14
Nodes (14): react, iconStyles, IconName, IconProps, IconRenderProps, SettingRowProps, ValidateAnalyzingStageProps, ANALYZING_STEPS (+6 more)

### Community 9 - "expo"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, projectId (+18 more)

### Community 10 - "steps"
Cohesion: 0.08
Nodes (26): concurrency, cancel-in-progress, group, EXPO_PUBLIC_API_URL, jobs, validate, name, on (+18 more)

### Community 11 - "react-test-renderer"
Cohesion: 0.12
Nodes (15): react-test-renderer, TestHarness(), UseCanvasOptions, mockGoBack, mockIdeaWithCompetitors, mockNavigate, mockRefreshUser, mockRouteParams (+7 more)

### Community 12 - "AuthContext.tsx"
Cohesion: 0.20
Nodes (18): AuthContextType, AuthProvider(), logAuthWarning(), createAuthTestRenderer(), createDeferred(), mockUser, authApi, ForgotPasswordParams (+10 more)

### Community 13 - "ApiError"
Cohesion: 0.12
Nodes (17): mockRefreshUser, mockSignOut, mockUser, mockGoBack, mockNavigate, mockRefreshUser, mockGoBack, mockNavigate (+9 more)

### Community 14 - "HomeScreen.tsx"
Cohesion: 0.16
Nodes (13): HomeHeader(), HomeHeaderProps, HomeQuickActions(), HomeQuickActionsProps, HomeScreen(), NavigationProp, styles, mockNavigate (+5 more)

### Community 15 - "apiClient.ts"
Cohesion: 0.23
Nodes (9): RFC-4122, AI_GENERATION_TIMEOUT_MS, apiClient, ApiErrorCode, DEFAULT_TIMEOUT_MS, generateRequestId(), setUnauthorizedHandler(), UnauthorizedHandler (+1 more)

### Community 16 - "tokenStorage.ts"
Cohesion: 0.13
Nodes (9): mockClearError, mockNavigate, mockRouteParams, mockSignIn, AUTH_TOKEN_KEY, memoryStore, _resetMemoryStoreForTesting(), TokenStorageErrorCode (+1 more)

### Community 17 - "updates"
Cohesion: 0.12
Nodes (15): prefix, patterns, development-dependencies, day, interval, time, timezone, updates (+7 more)

### Community 18 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, expo-font@^58.0.12, expo-secure-store@~58.0.3, react@19.3.0, react-native@0.88.1, react-native-safe-area-context@~5.11.1, react-native-screens@~4.30.1, @react-native-vector-icons/lucide@^14.0.0 (+7 more)

### Community 19 - "IdeaDetailsScreen.modules.test.tsx"
Cohesion: 0.18
Nodes (12): fullIdeaFixture, ideaWithCanvasFixture, ideaWithoutCanvasFixture, ideaWithoutDeckFixture, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+4 more)

### Community 20 - "devDependencies"
Cohesion: 0.14
Nodes (14): devDependencies, jest@~30.5.2, jest-expo@~58.0.14, react-test-renderer@^19.3.0, @types/jest@30.0.0, @types/node@^26.6.5, @types/react@~19.3.0, typescript@~6.0.3 (+6 more)

### Community 21 - "IdeasScreen.tsx"
Cohesion: 0.24
Nodes (9): IdeasPagination(), FilterType, IdeasSearchBar(), IdeasScreen(), NavigationProp, RootStackParamList, formatDisplayDate(), formatDisplayDateTime() (+1 more)

### Community 22 - "ActivityScreen.tsx"
Cohesion: 0.33
Nodes (7): ActivityScreen(), getServiceVisuals(), styles, activityApi, ActivityHistoryItem, BackendServiceType, GetActivityHistoryParams

### Community 23 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+4 more)

### Community 24 - "env.ts"
Cohesion: 0.26
Nodes (7): AppConfig, config, DEFAULT_API_URL, getAppConfig(), getDefaultApiUrl(), isDemoTopUpEnabled(), sanitizeApiUrl()

### Community 25 - "GoogleSignInButton.tsx"
Cohesion: 0.23
Nodes (9): GoogleLogo(), GoogleSignInButton(), GoogleSignInButtonProps, styles, AuthSuccessResponse, checkGoogleSignInStatus(), googleAuthService, GoogleSignInConfig (+1 more)

### Community 26 - "package.json"
Cohesion: 0.18
Nodes (10): expo-status-bar@~58.0.5, @testing-library/react-native@^14.1.0, @types/react-test-renderer@^19.3.0, main, name, private, version, expo-status-bar (+2 more)

### Community 27 - "BottomTabNavigator.tsx"
Cohesion: 0.22
Nodes (8): BottomTabNavigator(), CenterValidateButton(), styles, Tab, TabIconWithDotProps, TabItem(), MainTabParamList, RootStackNavigationProp

### Community 28 - "PitchSimulatorScreen.test.tsx"
Cohesion: 0.29
Nodes (6): mockGoBack, mockIdeaWithoutSimulation, mockNavigate, mockRefreshUser, mockRouteParams, mockSimulatedQuestions

### Community 29 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

### Community 31 - "App.tsx"
Cohesion: 0.50
Nodes (3): expo@~58.0.25, expo, App()

## Knowledge Gaps
- **2 isolated node(s):** `RFC-4122`, `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 307 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `Icon`, `PitchDeckScreen.tsx`, `RootNavigator.tsx`, `SignInScreen.tsx`, `ideasApi.ts`, `CanvasScreen.tsx`, `react`, `react-test-renderer`, `ApiError`, `HomeScreen.tsx`, `tokenStorage.ts`, `dependencies`, `IdeaDetailsScreen.modules.test.tsx`, `IdeasScreen.tsx`, `ActivityScreen.tsx`, `env.ts`, `GoogleSignInButton.tsx`, `package.json`, `BottomTabNavigator.tsx`, `PitchSimulatorScreen.test.tsx`?**
  _High betweenness centrality (0.225) - this node is a cross-community bridge._
- **What connects `RFC-4122`, `expo/tsconfig.base` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `react-native` be split into smaller, more focused modules?**
  _Cohesion score 0.06227106227106227 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `react-native`, `Icon`, `PitchDeckScreen.tsx`, `RootNavigator.tsx`, `SignInScreen.tsx`, `ideasApi.ts`, `CanvasScreen.tsx`, `react-test-renderer`, `AuthContext.tsx`, `ApiError`, `HomeScreen.tsx`, `tokenStorage.ts`, `dependencies`, `IdeaDetailsScreen.modules.test.tsx`, `IdeasScreen.tsx`, `ActivityScreen.tsx`, `GoogleSignInButton.tsx`, `package.json`, `BottomTabNavigator.tsx`, `PitchSimulatorScreen.test.tsx`, `useValidateIdea.idempotency.test.tsx`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **Should `Icon` be split into smaller, more focused modules?**
  _Cohesion score 0.08756900818579859 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Should `PitchDeckScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.056338028169014086 - nodes in this community are weakly interconnected._