# Graph Report - PitchMint-mobile  (2026-11-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 740 nodes · 2372 edges · 27 communities (25 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1da1ba4e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react-native
- Icon
- SignInScreen.tsx
- AuthContext.tsx
- BottomTabNavigator.tsx
- with
- ValidateResultsStage.tsx
- PitchDeckScreen.tsx
- react
- IdeasScreen.tsx
- expo
- steps
- package.json
- ProfileScreen.test.tsx
- updates
- CanvasScreen.generation.test.tsx
- IdeaDetailsScreen.modules.test.tsx
- useIdeaDetails.ts
- apiClient.ts
- dependencies
- scripts
- ideasApi
- ideasApi.ts
- tsconfig.json
- AppErrorBoundary
- App.tsx

## God Nodes (most connected - your core abstractions)
1. `react-native` - 101 edges
2. `react` - 87 edges
3. `Icon()` - 70 edges
4. `Card()` - 45 edges
5. `IconBadge()` - 38 edges
6. `Button()` - 30 edges
7. `ApiError` - 27 edges
8. `useAuth()` - 25 edges
9. `react-test-renderer` - 24 edges
10. `ideasApi` - 21 edges

## Surprising Connections (you probably didn't know these)
- `HomeScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/home/screens/HomeScreen.tsx → src/services/api/ideasApi.ts
- `IdeasScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/ideas/screens/IdeasScreen.tsx → src/services/api/ideasApi.ts
- `IdeaCardProps` --references--> `ParsedIdeaCard`  [EXTRACTED]
  src/components/IdeaCard.tsx → src/utils/ideaParser.ts
- `BadgeProps` --references--> `Tone`  [EXTRACTED]
  src/components/Badge.tsx → src/theme/colors.ts
- `PillProps` --references--> `Tone`  [EXTRACTED]
  src/components/Pill.tsx → src/theme/colors.ts

## Import Cycles
- None detected.

## Communities (27 total, 2 thin omitted)

### Community 0 - "react-native"
Cohesion: 0.08
Nodes (45): react-native, AppProviders(), AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles, AuthCardProps, styles (+37 more)

### Community 1 - "Icon"
Cohesion: 0.11
Nodes (51): Badge(), Button(), Card(), CreditConfirmationModal(), formatCreditValue(), Icon(), IconBadge(), IdeaCard() (+43 more)

### Community 2 - "SignInScreen.tsx"
Cohesion: 0.09
Nodes (40): @react-navigation/native, @react-navigation/native-stack, AuthCard(), GoogleLogo(), GoogleSignInButton(), GoogleSignInButtonProps, styles, Input() (+32 more)

### Community 3 - "AuthContext.tsx"
Cohesion: 0.08
Nodes (36): react-test-renderer, AuthContextType, AuthProvider(), logAuthWarning(), createAuthTestRenderer(), createDeferred(), mockUser, mockClearError (+28 more)

### Community 4 - "BottomTabNavigator.tsx"
Cohesion: 0.06
Nodes (31): react-native-safe-area-context@~5.11.1, expo-secure-store, react-native-safe-area-context, AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider(), useOnboarding() (+23 more)

### Community 5 - "with"
Cohesion: 0.05
Nodes (46): if, name, needs, permissions, runs-on, steps, concurrency, cancel-in-progress (+38 more)

### Community 6 - "ValidateResultsStage.tsx"
Cohesion: 0.09
Nodes (22): { withAndroidManifest }, AppConfig, config, DEFAULT_API_URL, getAppConfig(), getDefaultApiUrl(), isDemoTopUpEnabled(), sanitizeApiUrl() (+14 more)

### Community 7 - "PitchDeckScreen.tsx"
Cohesion: 0.10
Nodes (18): CANVAS_BLOCK_DEFINITIONS, TestHarness(), useCanvas(), UseCanvasOptions, formatCanvasAsMarkdown(), PitchDeckSlideStrip(), PitchDeckSlideStripProps, PitchDeckSlideViewerProps (+10 more)

### Community 8 - "react"
Cohesion: 0.15
Nodes (21): react, renderActionIcon(), iconStyles, renderMediaIcon(), renderNavigationIcon(), renderStatusIcon(), IconName, IconProps (+13 more)

### Community 9 - "IdeasScreen.tsx"
Cohesion: 0.13
Nodes (18): getServiceVisuals(), styles, IdeasPagination(), IdeasPaginationProps, FilterType, IdeasSearchBar(), IdeasSearchBarProps, IdeasScreen() (+10 more)

### Community 10 - "expo"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, projectId (+18 more)

### Community 11 - "steps"
Cohesion: 0.08
Nodes (26): concurrency, cancel-in-progress, group, EXPO_PUBLIC_API_URL, jobs, validate, name, on (+18 more)

### Community 12 - "package.json"
Cohesion: 0.12
Nodes (22): devDependencies, jest@~30.5.2, jest-expo@~58.0.14, react-test-renderer@^19.3.0, @testing-library/react-native@^14.1.0, @types/jest@30.0.0, @types/node@^26.6.5, @types/react@~19.3.0 (+14 more)

### Community 13 - "ProfileScreen.test.tsx"
Cohesion: 0.12
Nodes (16): mockRefreshUser, mockSignOut, mockUser, mockGoBack, mockNavigate, mockRefreshUser, mockGoBack, mockNavigate (+8 more)

### Community 14 - "updates"
Cohesion: 0.12
Nodes (15): prefix, patterns, development-dependencies, day, interval, time, timezone, updates (+7 more)

### Community 15 - "CanvasScreen.generation.test.tsx"
Cohesion: 0.18
Nodes (12): expo-clipboard@~58.0.4, expo-clipboard, sampleIdeaWithCanvas, sampleIdeaWithoutCanvas, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+4 more)

### Community 16 - "IdeaDetailsScreen.modules.test.tsx"
Cohesion: 0.18
Nodes (12): fullIdeaFixture, ideaWithCanvasFixture, ideaWithoutCanvasFixture, ideaWithoutDeckFixture, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+4 more)

### Community 17 - "useIdeaDetails.ts"
Cohesion: 0.23
Nodes (11): IdeaActionModulesProps, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams, TestHarness(), useIdeaDetails(), UseIdeaDetailsResult (+3 more)

### Community 18 - "apiClient.ts"
Cohesion: 0.30
Nodes (6): RFC-4122, AI_GENERATION_TIMEOUT_MS, apiClient, ApiErrorCode, DEFAULT_TIMEOUT_MS, UnauthorizedHandler

### Community 19 - "dependencies"
Cohesion: 0.17
Nodes (12): dependencies, expo-secure-store@~58.0.3, expo-status-bar@~58.0.5, react@19.3.0, react-native@0.88.1, react-native-screens@~4.30.1, @react-navigation/bottom-tabs@^7.20.0, @react-navigation/native@^7.5.0 (+4 more)

### Community 20 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+4 more)

### Community 21 - "ideasApi"
Cohesion: 0.18
Nodes (8): mockNavigate, mockRefreshUser, mockUser, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams, ideasApi

### Community 22 - "ideasApi.ts"
Cohesion: 0.22
Nodes (8): CanvasContentData, CompetitorItem, CompetitorSwot, GetSavedIdeasParams, PitchDeckSlideItem, PitchSimulationQuestion, SavedIdeasResponse, SubmitIdeaRequest

### Community 23 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

### Community 25 - "App.tsx"
Cohesion: 0.50
Nodes (3): expo@~58.0.25, expo, App()

## Knowledge Gaps
- **2 isolated node(s):** `RFC-4122`, `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 266 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `Icon`, `SignInScreen.tsx`, `AuthContext.tsx`, `BottomTabNavigator.tsx`, `ValidateResultsStage.tsx`, `PitchDeckScreen.tsx`, `react`, `IdeasScreen.tsx`, `package.json`, `ProfileScreen.test.tsx`, `CanvasScreen.generation.test.tsx`, `IdeaDetailsScreen.modules.test.tsx`, `useIdeaDetails.ts`, `dependencies`, `ideasApi`?**
  _High betweenness centrality (0.179) - this node is a cross-community bridge._
- **What connects `RFC-4122`, `expo/tsconfig.base` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `react-native` be split into smaller, more focused modules?**
  _Cohesion score 0.0757314974182444 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `react-native`, `Icon`, `SignInScreen.tsx`, `AuthContext.tsx`, `BottomTabNavigator.tsx`, `ValidateResultsStage.tsx`, `PitchDeckScreen.tsx`, `IdeasScreen.tsx`, `package.json`, `ProfileScreen.test.tsx`, `CanvasScreen.generation.test.tsx`, `IdeaDetailsScreen.modules.test.tsx`, `useIdeaDetails.ts`, `dependencies`, `ideasApi`?**
  _High betweenness centrality (0.127) - this node is a cross-community bridge._
- **Should `Icon` be split into smaller, more focused modules?**
  _Cohesion score 0.10774774774774774 - nodes in this community are weakly interconnected._
- **Why does `Icon()` connect `Icon` to `react-native`, `SignInScreen.tsx`, `BottomTabNavigator.tsx`, `ValidateResultsStage.tsx`, `PitchDeckScreen.tsx`, `react`, `IdeasScreen.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `SignInScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._