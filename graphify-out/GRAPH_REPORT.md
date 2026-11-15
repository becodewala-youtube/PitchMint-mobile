# Graph Report - PitchMint-mobile  (2026-11-15)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 840 nodes · 2829 edges · 30 communities (26 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cdda124f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Icon
- react-native
- react
- RootNavigator.tsx
- ValidateResultsStage.tsx
- with
- OnboardingScreen.tsx
- PitchDeckScreen.tsx
- react-test-renderer
- expo
- steps
- AuthContext.tsx
- ProfileScreen.tsx
- package.json
- ideasApi.ts
- tokenStorage.ts
- IdeaDetailsScreen.modules.test.tsx
- dependencies
- updates
- apiClient.ts
- CanvasScreen.generation.test.tsx
- ActivityScreen.tsx
- scripts
- GoogleSignInButton.tsx
- tsconfig.json
- AppErrorBoundary
- PitchDeckScreen.test.tsx
- expo
- @react-native-vector-icons/lucide

## God Nodes (most connected - your core abstractions)
1. `react-native` - 122 edges
2. `react` - 107 edges
3. `Icon()` - 75 edges
4. `Card()` - 56 edges
5. `Button()` - 43 edges
6. `IconBadge()` - 41 edges
7. `react-test-renderer` - 34 edges
8. `ideasApi` - 31 edges
9. `ApiError` - 30 edges
10. `useAuth()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `SettingRowProps` --references--> `IconName`  [EXTRACTED]
  src/features/profile/components/SettingRow.tsx → src/components/icons/types.ts
- `ValidateTip` --references--> `IconName`  [EXTRACTED]
  src/features/validate/constants/validateConstants.ts → src/components/icons/types.ts
- `TestHarness()` --calls--> `useIdeaDetails()`  [EXTRACTED]
  src/features/ideas/hooks/__tests__/useIdeaDetails.recovery.test.tsx → src/features/ideas/hooks/useIdeaDetails.ts
- `CanvasBlockSelectorProps` --references--> `CanvasBlockDefinition`  [EXTRACTED]
  src/features/canvas/components/CanvasBlockSelector.tsx → src/features/canvas/constants/blockDefinitions.ts
- `CanvasBlockViewerProps` --references--> `CanvasBlockDefinition`  [EXTRACTED]
  src/features/canvas/components/CanvasBlockViewer.tsx → src/features/canvas/constants/blockDefinitions.ts

## Import Cycles
- None detected.

## Communities (30 total, 4 thin omitted)

### Community 0 - "Icon"
Cohesion: 0.08
Nodes (65): Badge(), Button(), Card(), CardProps, styles, CreditConfirmationModal(), CreditConfirmationModalProps, formatCreditValue() (+57 more)

### Community 1 - "react-native"
Cohesion: 0.06
Nodes (52): react-native, react-native-safe-area-context, App(), AppProviders(), AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles (+44 more)

### Community 2 - "react"
Cohesion: 0.06
Nodes (39): react, iconStyles, IconName, IconProps, IconRenderProps, IdeaCardProps, ideaCardStyles, HomeHeader() (+31 more)

### Community 3 - "RootNavigator.tsx"
Cohesion: 0.08
Nodes (41): @react-navigation/native, @react-navigation/native-stack, AuthCard(), GoogleSignInButton(), Input(), useAuth(), useOnboarding(), AuthLoadingScreen() (+33 more)

### Community 4 - "ValidateResultsStage.tsx"
Cohesion: 0.08
Nodes (29): { withAndroidManifest }, ScoreBar(), getScoreColor(), ScoreRing(), ScoreRingProps, styles, AppConfig, config (+21 more)

### Community 5 - "with"
Cohesion: 0.05
Nodes (46): if, name, needs, permissions, runs-on, steps, concurrency, cancel-in-progress (+38 more)

### Community 6 - "OnboardingScreen.tsx"
Cohesion: 0.08
Nodes (26): expo-secure-store, AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider(), ChatVisual(), DeckVisual(), StackVisual() (+18 more)

### Community 7 - "PitchDeckScreen.tsx"
Cohesion: 0.10
Nodes (18): expo-print, expo-sharing, CANVAS_BLOCK_DEFINITIONS, TestHarness(), TestHarness(), useCanvas(), formatCanvasAsMarkdown(), PitchDeckSlideStrip() (+10 more)

### Community 8 - "react-test-renderer"
Cohesion: 0.10
Nodes (22): react-test-renderer, mockGoBack, mockIdeaWithCompetitors, mockNavigate, mockRefreshUser, mockRouteParams, mockGoBack, mockNavigate (+14 more)

### Community 9 - "expo"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, projectId (+18 more)

### Community 10 - "steps"
Cohesion: 0.08
Nodes (26): concurrency, cancel-in-progress, group, EXPO_PUBLIC_API_URL, jobs, validate, name, on (+18 more)

### Community 11 - "AuthContext.tsx"
Cohesion: 0.20
Nodes (18): AuthContextType, AuthProvider(), logAuthWarning(), createAuthTestRenderer(), createDeferred(), mockUser, authApi, ForgotPasswordParams (+10 more)

### Community 12 - "ProfileScreen.tsx"
Cohesion: 0.12
Nodes (17): mockRefreshUser, mockSignOut, mockUser, mockGoBack, mockNavigate, mockRefreshUser, mockGoBack, mockNavigate (+9 more)

### Community 13 - "package.json"
Cohesion: 0.12
Nodes (22): devDependencies, jest@~30.5.2, jest-expo@~58.0.14, react-test-renderer@^19.3.0, @testing-library/react-native@^14.1.0, @types/jest@30.0.0, @types/node@^26.6.5, @types/react@~19.3.0 (+14 more)

### Community 14 - "ideasApi.ts"
Cohesion: 0.16
Nodes (19): CompetitorActionModuleProps, IdeaActionModulesProps, PitchSimulationActionModuleProps, UseIdeaDetailsResult, BackendIdea, CanvasContentData, CanvasResponse, CompetitorAnalysisResponse (+11 more)

### Community 15 - "tokenStorage.ts"
Cohesion: 0.13
Nodes (10): mockClearError, mockNavigate, mockRouteParams, mockSignIn, AUTH_TOKEN_KEY, memoryStore, _resetMemoryStoreForTesting(), tokenStorage (+2 more)

### Community 16 - "IdeaDetailsScreen.modules.test.tsx"
Cohesion: 0.15
Nodes (13): UseCanvasOptions, fullIdeaFixture, ideaWithCanvasFixture, ideaWithoutCanvasFixture, ideaWithoutDeckFixture, mockGoBack, mockNavigate, mockRefreshUser (+5 more)

### Community 17 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, expo-font@^58.0.12, expo-print@~58.0.9, expo-secure-store@~58.0.3, expo-sharing@~58.0.23, expo-status-bar@~58.0.5, react@19.3.0, react-native@0.88.1 (+9 more)

### Community 18 - "updates"
Cohesion: 0.12
Nodes (15): prefix, patterns, development-dependencies, day, interval, time, timezone, updates (+7 more)

### Community 19 - "apiClient.ts"
Cohesion: 0.27
Nodes (8): RFC-4122, AI_GENERATION_TIMEOUT_MS, apiClient, ApiErrorCode, DEFAULT_TIMEOUT_MS, generateRequestId(), setUnauthorizedHandler(), UnauthorizedHandler

### Community 20 - "CanvasScreen.generation.test.tsx"
Cohesion: 0.18
Nodes (12): expo-clipboard@~58.0.4, expo-clipboard, sampleIdeaWithCanvas, sampleIdeaWithoutCanvas, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+4 more)

### Community 21 - "ActivityScreen.tsx"
Cohesion: 0.33
Nodes (7): ActivityScreen(), getServiceVisuals(), styles, activityApi, ActivityHistoryItem, BackendServiceType, GetActivityHistoryParams

### Community 22 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+4 more)

### Community 23 - "GoogleSignInButton.tsx"
Cohesion: 0.24
Nodes (8): GoogleLogo(), GoogleSignInButtonProps, styles, AuthSuccessResponse, checkGoogleSignInStatus(), googleAuthService, GoogleSignInConfig, GoogleSignInStatus

### Community 24 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

### Community 26 - "PitchDeckScreen.test.tsx"
Cohesion: 0.33
Nodes (4): mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams

## Knowledge Gaps
- **2 isolated node(s):** `RFC-4122`, `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 290 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `Icon`, `react`, `RootNavigator.tsx`, `ValidateResultsStage.tsx`, `OnboardingScreen.tsx`, `PitchDeckScreen.tsx`, `react-test-renderer`, `ProfileScreen.tsx`, `package.json`, `ideasApi.ts`, `tokenStorage.ts`, `IdeaDetailsScreen.modules.test.tsx`, `dependencies`, `CanvasScreen.generation.test.tsx`, `ActivityScreen.tsx`, `GoogleSignInButton.tsx`, `PitchDeckScreen.test.tsx`?**
  _High betweenness centrality (0.188) - this node is a cross-community bridge._
- **What connects `RFC-4122`, `expo/tsconfig.base` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `Icon` be split into smaller, more focused modules?**
  _Cohesion score 0.08395202741290692 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `Icon`, `react-native`, `RootNavigator.tsx`, `ValidateResultsStage.tsx`, `OnboardingScreen.tsx`, `PitchDeckScreen.tsx`, `react-test-renderer`, `AuthContext.tsx`, `ProfileScreen.tsx`, `package.json`, `ideasApi.ts`, `tokenStorage.ts`, `IdeaDetailsScreen.modules.test.tsx`, `dependencies`, `CanvasScreen.generation.test.tsx`, `ActivityScreen.tsx`, `GoogleSignInButton.tsx`, `PitchDeckScreen.test.tsx`?**
  _High betweenness centrality (0.140) - this node is a cross-community bridge._
- **Should `react-native` be split into smaller, more focused modules?**
  _Cohesion score 0.062285223367697595 - nodes in this community are weakly interconnected._
- **Why does `Icon()` connect `Icon` to `react-native`, `react`, `RootNavigator.tsx`, `ValidateResultsStage.tsx`, `OnboardingScreen.tsx`, `PitchDeckScreen.tsx`, `ProfileScreen.tsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.061815336463223784 - nodes in this community are weakly interconnected._