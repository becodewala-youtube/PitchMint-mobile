# Graph Report - PitchMint-mobile  (2026-11-21)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 889 nodes · 2934 edges · 31 communities (29 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fec7be9a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Icon
- react-native
- IdeasScreen.tsx
- AuthContext.tsx
- RootNavigator.tsx
- with
- PitchDeckScreen.tsx
- pdfExport.ts
- react
- ValidateModalScreen.tsx
- expo
- steps
- package.json
- react-test-renderer
- ApiError
- ideasApi.ts
- dependencies
- apiClient.ts
- ActivityScreen.tsx
- updates
- IdeaDetailsScreen.modules.test.tsx
- CanvasScreen.generation.test.tsx
- scripts
- useIdeaDetails.recovery.test.tsx
- PitchSimulatorScreen.test.tsx
- tsconfig.json
- AppErrorBoundary
- PitchDeckScreen.test.tsx
- App.tsx
- expo-print

## God Nodes (most connected - your core abstractions)
1. `react-native` - 127 edges
2. `react` - 109 edges
3. `Icon()` - 71 edges
4. `Card()` - 52 edges
5. `Button()` - 41 edges
6. `IconBadge()` - 41 edges
7. `react-test-renderer` - 36 edges
8. `ideasApi` - 32 edges
9. `ApiError` - 30 edges
10. `useAuth()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `UseIdeaDetailsResult` --references--> `BackendIdea`  [EXTRACTED]
  src/features/ideas/hooks/useIdeaDetails.ts → src/services/api/ideasApi.types.ts
- `ValidateTip` --references--> `IconName`  [EXTRACTED]
  src/features/validate/constants/validateConstants.ts → src/components/icons/types.ts
- `IdeasScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/ideas/screens/IdeasScreen.tsx → src/services/api/ideasApi.ts
- `CanvasBlockSelectorProps` --references--> `CanvasBlockDefinition`  [EXTRACTED]
  src/features/canvas/components/CanvasBlockSelector.tsx → src/features/canvas/constants/blockDefinitions.ts
- `CanvasBlockViewerProps` --references--> `CanvasBlockDefinition`  [EXTRACTED]
  src/features/canvas/components/CanvasBlockViewer.tsx → src/features/canvas/constants/blockDefinitions.ts

## Import Cycles
- None detected.

## Communities (31 total, 2 thin omitted)

### Community 0 - "Icon"
Cohesion: 0.08
Nodes (65): Badge(), Button(), Card(), CreditConfirmationModal(), DeleteConfirmationModal(), Icon(), IconBadge(), IdeaCard() (+57 more)

### Community 1 - "react-native"
Cohesion: 0.07
Nodes (51): react-native, AppProviders(), AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles, AuthCardProps, styles (+43 more)

### Community 2 - "IdeasScreen.tsx"
Cohesion: 0.06
Nodes (51): @react-navigation/native, @react-navigation/native-stack, AuthCard(), Input(), EmailVerificationNavigationProp, EmailVerificationRouteProp, EmailVerificationScreen(), styles (+43 more)

### Community 3 - "AuthContext.tsx"
Cohesion: 0.07
Nodes (36): GoogleLogo(), GoogleSignInButton(), GoogleSignInButtonProps, styles, AuthContextType, AuthProvider(), logAuthWarning(), createAuthTestRenderer() (+28 more)

### Community 4 - "RootNavigator.tsx"
Cohesion: 0.07
Nodes (31): expo-secure-store, AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider(), useOnboarding(), AuthLoadingScreen(), ChatVisual() (+23 more)

### Community 5 - "with"
Cohesion: 0.05
Nodes (46): if, name, needs, permissions, runs-on, steps, concurrency, cancel-in-progress (+38 more)

### Community 6 - "PitchDeckScreen.tsx"
Cohesion: 0.09
Nodes (23): IdeaCardProps, CANVAS_BLOCK_DEFINITIONS, TestHarness(), TestHarness(), useCanvas(), formatCanvasAsMarkdown(), PitchDeckSlideStrip(), PitchDeckSlideStripProps (+15 more)

### Community 7 - "pdfExport.ts"
Cohesion: 0.10
Nodes (27): expo-file-system@~58.0.14, expo-file-system, clearStoredDownloadDirectoryUri(), DOWNLOAD_DIRECTORY_URI_KEY, getStoredDownloadDirectoryUri(), isSecureStoreAvailable(), memoryStore, _resetMemoryStoreForTesting() (+19 more)

### Community 8 - "react"
Cohesion: 0.10
Nodes (20): react, iconStyles, IconName, IconProps, IconRenderProps, HomeHeader(), HomeHeaderProps, HomeQuickActions() (+12 more)

### Community 9 - "ValidateModalScreen.tsx"
Cohesion: 0.10
Nodes (21): { withAndroidManifest }, AppConfig, config, DEFAULT_API_URL, getAppConfig(), getDefaultApiUrl(), isDemoTopUpEnabled(), sanitizeApiUrl() (+13 more)

### Community 10 - "expo"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, projectId (+18 more)

### Community 11 - "steps"
Cohesion: 0.08
Nodes (26): concurrency, cancel-in-progress, group, EXPO_PUBLIC_API_URL, jobs, validate, name, on (+18 more)

### Community 12 - "package.json"
Cohesion: 0.12
Nodes (22): devDependencies, jest@~30.5.2, jest-expo@~58.0.15, react-test-renderer@^19.3.0, @testing-library/react-native@^14.1.0, @types/jest@30.0.0, @types/node@^26.6.5, @types/react@~19.3.0 (+14 more)

### Community 13 - "react-test-renderer"
Cohesion: 0.12
Nodes (15): react-test-renderer, UseCanvasOptions, mockGoBack, mockIdeaWithCompetitors, mockNavigate, mockRefreshUser, mockRouteParams, mockNavigate (+7 more)

### Community 14 - "ApiError"
Cohesion: 0.11
Nodes (17): mockRefreshUser, mockSignOut, mockUser, mockGoBack, mockNavigate, mockRefreshUser, mockGoBack, mockNavigate (+9 more)

### Community 15 - "ideasApi.ts"
Cohesion: 0.16
Nodes (19): CompetitorActionModuleProps, IdeaActionModulesProps, PitchSimulationActionModuleProps, BackendIdea, CanvasContentData, CanvasResponse, CompetitorAnalysisResponse, CompetitorSwot (+11 more)

### Community 16 - "dependencies"
Cohesion: 0.11
Nodes (19): dependencies, expo-clipboard@~58.0.4, expo-secure-store@~58.0.3, expo-sharing@~58.0.23, expo-status-bar@~58.0.5, react@19.3.0, react-native@0.88.1, react-native-safe-area-context@~5.11.1 (+11 more)

### Community 17 - "apiClient.ts"
Cohesion: 0.23
Nodes (9): RFC-4122, AI_GENERATION_TIMEOUT_MS, apiClient, ApiErrorCode, DEFAULT_TIMEOUT_MS, generateRequestId(), setUnauthorizedHandler(), UnauthorizedHandler (+1 more)

### Community 18 - "ActivityScreen.tsx"
Cohesion: 0.25
Nodes (10): ActivityScreen(), getServiceVisuals(), styles, activityApi, ActivityHistoryItem, BackendServiceType, GetActivityHistoryParams, formatDisplayDate() (+2 more)

### Community 19 - "updates"
Cohesion: 0.12
Nodes (15): prefix, patterns, development-dependencies, day, interval, time, timezone, updates (+7 more)

### Community 20 - "IdeaDetailsScreen.modules.test.tsx"
Cohesion: 0.18
Nodes (12): fullIdeaFixture, ideaWithCanvasFixture, ideaWithoutCanvasFixture, ideaWithoutDeckFixture, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+4 more)

### Community 21 - "CanvasScreen.generation.test.tsx"
Cohesion: 0.20
Nodes (11): expo-clipboard, sampleIdeaWithCanvas, sampleIdeaWithoutCanvas, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams, mockGoBack (+3 more)

### Community 22 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+4 more)

### Community 23 - "useIdeaDetails.recovery.test.tsx"
Cohesion: 0.33
Nodes (6): mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams, TestHarness(), useIdeaDetails()

### Community 24 - "PitchSimulatorScreen.test.tsx"
Cohesion: 0.29
Nodes (6): mockGoBack, mockIdeaWithoutSimulation, mockNavigate, mockRefreshUser, mockRouteParams, mockSimulatedQuestions

### Community 25 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

### Community 27 - "PitchDeckScreen.test.tsx"
Cohesion: 0.33
Nodes (4): mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams

### Community 28 - "App.tsx"
Cohesion: 0.50
Nodes (3): expo@~58.0.26, expo, App()

### Community 29 - "expo-print"
Cohesion: 0.33
Nodes (4): expo-font@^58.0.12, expo-print@~58.0.9, expo-font, expo-print

## Knowledge Gaps
- **2 isolated node(s):** `RFC-4122`, `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 308 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `Icon`, `IdeasScreen.tsx`, `AuthContext.tsx`, `RootNavigator.tsx`, `PitchDeckScreen.tsx`, `pdfExport.ts`, `react`, `ValidateModalScreen.tsx`, `package.json`, `react-test-renderer`, `ApiError`, `ideasApi.ts`, `dependencies`, `ActivityScreen.tsx`, `IdeaDetailsScreen.modules.test.tsx`, `CanvasScreen.generation.test.tsx`, `useIdeaDetails.recovery.test.tsx`, `PitchSimulatorScreen.test.tsx`, `PitchDeckScreen.test.tsx`?**
  _High betweenness centrality (0.226) - this node is a cross-community bridge._
- **What connects `RFC-4122`, `expo/tsconfig.base` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `Icon` be split into smaller, more focused modules?**
  _Cohesion score 0.08411214953271028 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `Icon`, `react-native`, `IdeasScreen.tsx`, `AuthContext.tsx`, `RootNavigator.tsx`, `PitchDeckScreen.tsx`, `ValidateModalScreen.tsx`, `package.json`, `react-test-renderer`, `ApiError`, `ideasApi.ts`, `dependencies`, `ActivityScreen.tsx`, `IdeaDetailsScreen.modules.test.tsx`, `CanvasScreen.generation.test.tsx`, `useIdeaDetails.recovery.test.tsx`, `PitchSimulatorScreen.test.tsx`, `PitchDeckScreen.test.tsx`?**
  _High betweenness centrality (0.132) - this node is a cross-community bridge._
- **Should `react-native` be split into smaller, more focused modules?**
  _Cohesion score 0.06637806637806638 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Should `IdeasScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06418219461697723 - nodes in this community are weakly interconnected._