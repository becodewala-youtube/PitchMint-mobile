# Graph Report - PitchMint-mobile  (2026-11-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 726 nodes · 2309 edges · 34 communities (32 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7b996b1f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Icon
- react-native
- SignInScreen.tsx
- with
- RootNavigator.tsx
- react
- PitchDeckScreen.tsx
- expo
- steps
- ideasApi.ts
- package.json
- ValidateModalScreen.submission.test.tsx
- tokenStorage.ts
- updates
- CanvasScreen.generation.test.tsx
- env.ts
- IdeaDetailsScreen.modules.test.tsx
- BottomTabNavigator.tsx
- AuthContext.tsx
- dependencies
- scripts
- IdeasScreen.tsx
- GoogleSignInButton.tsx
- ActivityScreen.tsx
- apiClient.ts
- react-test-renderer
- AuthProvider
- ideasApi
- tsconfig.json
- AppErrorBoundary
- PitchDeckScreen.test.tsx
- App.tsx
- date.ts

## God Nodes (most connected - your core abstractions)
1. `react-native` - 98 edges
2. `react` - 84 edges
3. `Icon()` - 70 edges
4. `Card()` - 45 edges
5. `IconBadge()` - 38 edges
6. `Button()` - 30 edges
7. `useAuth()` - 25 edges
8. `ApiError` - 23 edges
9. `react-test-renderer` - 21 edges
10. `Pill()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `SettingRowProps` --references--> `IconName`  [EXTRACTED]
  src/features/profile/components/SettingRow.tsx → src/components/icons/types.ts
- `HomeScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/home/screens/HomeScreen.tsx → src/services/api/ideasApi.ts
- `IdeasScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/ideas/screens/IdeasScreen.tsx → src/services/api/ideasApi.ts
- `AuthProvider()` --calls--> `TokenStorageError`  [EXTRACTED]
  src/context/AuthContext.tsx → src/services/storage/tokenStorage.ts
- `CanvasBlockSelectorProps` --references--> `CanvasBlockDefinition`  [EXTRACTED]
  src/features/canvas/components/CanvasBlockSelector.tsx → src/features/canvas/constants/blockDefinitions.ts

## Import Cycles
- None detected.

## Communities (34 total, 2 thin omitted)

### Community 0 - "Icon"
Cohesion: 0.09
Nodes (60): Badge(), Button(), Card(), CreditConfirmationModal(), formatCreditValue(), Icon(), IconBadge(), IdeaCard() (+52 more)

### Community 1 - "react-native"
Cohesion: 0.08
Nodes (43): react-native, AppProviders(), AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles, AuthCardProps, styles (+35 more)

### Community 2 - "SignInScreen.tsx"
Cohesion: 0.10
Nodes (37): @react-navigation/native, @react-navigation/native-stack, AuthCard(), GoogleSignInButton(), Input(), useAuth(), EmailVerificationNavigationProp, EmailVerificationRouteProp (+29 more)

### Community 3 - "with"
Cohesion: 0.05
Nodes (46): if, name, needs, permissions, runs-on, steps, concurrency, cancel-in-progress (+38 more)

### Community 4 - "RootNavigator.tsx"
Cohesion: 0.08
Nodes (23): expo-secure-store, AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider(), useOnboarding(), AuthLoadingScreen(), styles (+15 more)

### Community 5 - "react"
Cohesion: 0.11
Nodes (26): react, renderActionIcon(), iconStyles, renderMediaIcon(), renderNavigationIcon(), renderStatusIcon(), IconName, IconProps (+18 more)

### Community 6 - "PitchDeckScreen.tsx"
Cohesion: 0.12
Nodes (15): CANVAS_BLOCK_DEFINITIONS, useCanvas(), UseCanvasOptions, formatCanvasAsMarkdown(), PitchDeckSlideStrip(), PitchDeckSlideStripProps, PitchDeckSlideViewer(), PitchDeckSlideViewerProps (+7 more)

### Community 7 - "expo"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, projectId (+18 more)

### Community 8 - "steps"
Cohesion: 0.08
Nodes (26): concurrency, cancel-in-progress, group, EXPO_PUBLIC_API_URL, jobs, validate, name, on (+18 more)

### Community 9 - "ideasApi.ts"
Cohesion: 0.15
Nodes (19): IdeaCardProps, IdeaActionModulesProps, useIdeaDetails(), UseIdeaDetailsResult, BackendIdea, CanvasContentData, CanvasResponse, CompetitorItem (+11 more)

### Community 10 - "package.json"
Cohesion: 0.12
Nodes (22): devDependencies, jest@~30.5.2, jest-expo@~58.0.14, react-test-renderer@^19.3.0, @testing-library/react-native@^14.1.0, @types/jest@30.0.0, @types/node@^26.6.5, @types/react@~19.3.0 (+14 more)

### Community 11 - "ValidateModalScreen.submission.test.tsx"
Cohesion: 0.14
Nodes (14): ValidateResultsStageProps, mockGoBack, mockNavigate, mockRefreshUser, mockGoBack, mockNavigate, mockRefreshUser, CreditBalanceResponse (+6 more)

### Community 12 - "tokenStorage.ts"
Cohesion: 0.17
Nodes (10): mockClearError, mockNavigate, mockRouteParams, mockSignIn, AUTH_TOKEN_KEY, memoryStore, _resetMemoryStoreForTesting(), tokenStorage (+2 more)

### Community 13 - "updates"
Cohesion: 0.12
Nodes (15): prefix, patterns, development-dependencies, day, interval, time, timezone, updates (+7 more)

### Community 14 - "CanvasScreen.generation.test.tsx"
Cohesion: 0.18
Nodes (12): expo-clipboard@~58.0.4, expo-clipboard, sampleIdeaWithCanvas, sampleIdeaWithoutCanvas, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+4 more)

### Community 15 - "env.ts"
Cohesion: 0.18
Nodes (7): { withAndroidManifest }, AppConfig, DEFAULT_API_URL, getAppConfig(), getDefaultApiUrl(), isDemoTopUpEnabled(), sanitizeApiUrl()

### Community 16 - "IdeaDetailsScreen.modules.test.tsx"
Cohesion: 0.18
Nodes (12): fullIdeaFixture, ideaWithCanvasFixture, ideaWithoutCanvasFixture, ideaWithoutDeckFixture, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+4 more)

### Community 17 - "BottomTabNavigator.tsx"
Cohesion: 0.15
Nodes (8): @react-navigation/bottom-tabs@^7.20.0, @react-navigation/bottom-tabs, BottomTabNavigator(), styles, Tab, TabIconWithDotProps, MainTabParamList, RootStackNavigationProp

### Community 18 - "AuthContext.tsx"
Cohesion: 0.33
Nodes (11): AuthContextType, ForgotPasswordParams, GoogleAuthParams, MessageResponse, RegisterParams, RegisterResponse, ResendVerificationParams, ResetPasswordParams (+3 more)

### Community 19 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, expo-secure-store@~58.0.3, expo-status-bar@~58.0.5, react@19.3.0, react-native@0.88.1, react-native-safe-area-context@~5.11.1, react-native-screens@~4.30.1, @react-navigation/native@^7.5.0 (+4 more)

### Community 20 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+4 more)

### Community 21 - "IdeasScreen.tsx"
Cohesion: 0.30
Nodes (8): IdeasPagination(), IdeasPaginationProps, FilterType, IdeasSearchBar(), IdeasSearchBarProps, IdeasScreen(), NavigationProp, styles

### Community 22 - "GoogleSignInButton.tsx"
Cohesion: 0.24
Nodes (8): GoogleLogo(), GoogleSignInButtonProps, styles, AuthSuccessResponse, checkGoogleSignInStatus(), googleAuthService, GoogleSignInConfig, GoogleSignInStatus

### Community 23 - "ActivityScreen.tsx"
Cohesion: 0.38
Nodes (6): getServiceVisuals(), styles, activityApi, ActivityHistoryItem, BackendServiceType, GetActivityHistoryParams

### Community 24 - "apiClient.ts"
Cohesion: 0.31
Nodes (5): RFC-4122, apiClient, generateRequestId(), RequestOptions, UnauthorizedHandler

### Community 25 - "react-test-renderer"
Cohesion: 0.54
Nodes (5): react-test-renderer, createAuthTestRenderer(), createDeferred(), mockUser, authApi

### Community 26 - "AuthProvider"
Cohesion: 0.29
Nodes (4): AuthProvider(), logAuthWarning(), setUnauthorizedHandler(), TokenStorageService

### Community 27 - "ideasApi"
Cohesion: 0.29
Nodes (5): mockNavigate, mockRefreshUser, mockUser, mockNavigate, ideasApi

### Community 28 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

### Community 30 - "PitchDeckScreen.test.tsx"
Cohesion: 0.33
Nodes (4): mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams

### Community 31 - "App.tsx"
Cohesion: 0.50
Nodes (3): expo@~58.0.25, expo, App()

### Community 32 - "date.ts"
Cohesion: 0.90
Nodes (3): formatDisplayDate(), formatDisplayDateTime(), formatRelativeTime()

## Knowledge Gaps
- **2 isolated node(s):** `RFC-4122`, `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 264 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `Icon`, `SignInScreen.tsx`, `RootNavigator.tsx`, `react`, `PitchDeckScreen.tsx`, `ideasApi.ts`, `package.json`, `ValidateModalScreen.submission.test.tsx`, `tokenStorage.ts`, `CanvasScreen.generation.test.tsx`, `env.ts`, `IdeaDetailsScreen.modules.test.tsx`, `BottomTabNavigator.tsx`, `dependencies`, `IdeasScreen.tsx`, `GoogleSignInButton.tsx`, `ActivityScreen.tsx`, `ideasApi`, `PitchDeckScreen.test.tsx`?**
  _High betweenness centrality (0.178) - this node is a cross-community bridge._
- **What connects `RFC-4122`, `expo/tsconfig.base` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `Icon` be split into smaller, more focused modules?**
  _Cohesion score 0.08552317247969422 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `Icon`, `react-native`, `SignInScreen.tsx`, `RootNavigator.tsx`, `PitchDeckScreen.tsx`, `ideasApi.ts`, `package.json`, `ValidateModalScreen.submission.test.tsx`, `tokenStorage.ts`, `CanvasScreen.generation.test.tsx`, `IdeaDetailsScreen.modules.test.tsx`, `BottomTabNavigator.tsx`, `AuthContext.tsx`, `dependencies`, `IdeasScreen.tsx`, `GoogleSignInButton.tsx`, `ActivityScreen.tsx`, `react-test-renderer`, `ideasApi`, `PitchDeckScreen.test.tsx`?**
  _High betweenness centrality (0.125) - this node is a cross-community bridge._
- **Should `react-native` be split into smaller, more focused modules?**
  _Cohesion score 0.07949412827461608 - nodes in this community are weakly interconnected._
- **Why does `Icon()` connect `Icon` to `react-native`, `SignInScreen.tsx`, `RootNavigator.tsx`, `react`, `PitchDeckScreen.tsx`, `BottomTabNavigator.tsx`, `IdeasScreen.tsx`, `ActivityScreen.tsx`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Should `SignInScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10105580693815988 - nodes in this community are weakly interconnected._