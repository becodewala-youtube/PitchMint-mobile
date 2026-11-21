# Graph Report - PitchMint-mobile  (2026-11-21)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 896 nodes · 2967 edges · 33 communities (30 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `52ab9b6f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Icon
- react-native
- HomeScreen.tsx
- AuthContext.tsx
- RootNavigator.tsx
- SignInScreen.tsx
- with
- PitchDeckScreen.tsx
- ideasApi.ts
- expo
- steps
- react-test-renderer
- package.json
- dependencies
- pdfExport.ts
- ProfileScreen.test.tsx
- react
- updates
- env.ts
- apiClient.ts
- CanvasScreen.generation.test.tsx
- IdeaDetailsScreen.modules.test.tsx
- scripts
- useValidateIdea.ts
- downloadStorage.ts
- expo-file-system
- ApiError
- PitchSimulatorScreen.test.tsx
- tsconfig.json
- AppErrorBoundary
- CompetitorScreen.test.tsx
- MockFile

## God Nodes (most connected - your core abstractions)
1. `react-native` - 129 edges
2. `react` - 113 edges
3. `Icon()` - 71 edges
4. `Card()` - 50 edges
5. `Button()` - 41 edges
6. `IconBadge()` - 41 edges
7. `react-test-renderer` - 39 edges
8. `ideasApi` - 33 edges
9. `ApiError` - 30 edges
10. `useAuth()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `ValidateTip` --references--> `IconName`  [EXTRACTED]
  src/features/validate/constants/validateConstants.ts → src/components/icons/types.ts
- `CanvasBlockSelectorProps` --references--> `CanvasBlockDefinition`  [EXTRACTED]
  src/features/canvas/components/CanvasBlockSelector.tsx → src/features/canvas/constants/blockDefinitions.ts
- `CanvasBlockViewerProps` --references--> `CanvasBlockDefinition`  [EXTRACTED]
  src/features/canvas/components/CanvasBlockViewer.tsx → src/features/canvas/constants/blockDefinitions.ts
- `CompetitorCardProps` --references--> `CompetitorItem`  [EXTRACTED]
  src/features/competitors/components/CompetitorCard.tsx → src/services/api/ideasApi.types.ts
- `SwotMatrixViewProps` --references--> `CompetitorItem`  [EXTRACTED]
  src/features/competitors/components/SwotMatrixView.tsx → src/services/api/ideasApi.types.ts

## Import Cycles
- None detected.

## Communities (33 total, 3 thin omitted)

### Community 0 - "Icon"
Cohesion: 0.08
Nodes (68): Badge(), Button(), Card(), CreditConfirmationModal(), DeleteConfirmationModal(), Icon(), IconBadge(), IdeaCard() (+60 more)

### Community 1 - "react-native"
Cohesion: 0.06
Nodes (54): react-native, react-native-safe-area-context, App(), AppProviders(), AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles (+46 more)

### Community 2 - "HomeScreen.tsx"
Cohesion: 0.06
Nodes (41): IdeaCardProps, ideaCardStyles, ActivityScreen(), getServiceVisuals(), styles, HomeHeader(), HomeHeaderProps, HomeQuickActions() (+33 more)

### Community 3 - "AuthContext.tsx"
Cohesion: 0.07
Nodes (36): GoogleLogo(), GoogleSignInButtonProps, styles, AuthContextType, AuthProvider(), logAuthWarning(), createAuthTestRenderer(), createDeferred() (+28 more)

### Community 4 - "RootNavigator.tsx"
Cohesion: 0.07
Nodes (31): expo-secure-store, AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider(), useOnboarding(), AuthLoadingScreen(), ChatVisual() (+23 more)

### Community 5 - "SignInScreen.tsx"
Cohesion: 0.11
Nodes (36): @react-navigation/native, @react-navigation/native-stack, AuthCard(), GoogleSignInButton(), Input(), useAuth(), EmailVerificationNavigationProp, EmailVerificationRouteProp (+28 more)

### Community 6 - "with"
Cohesion: 0.05
Nodes (46): if, name, needs, permissions, runs-on, steps, concurrency, cancel-in-progress (+38 more)

### Community 7 - "PitchDeckScreen.tsx"
Cohesion: 0.12
Nodes (15): CANVAS_BLOCK_DEFINITIONS, formatCanvasAsMarkdown(), PitchDeckControls(), PitchDeckSlideStrip(), PitchDeckSlideStripProps, PitchDeckSlideViewer(), PitchDeckSlideViewerProps, SLIDE_DEFINITIONS (+7 more)

### Community 8 - "ideasApi.ts"
Cohesion: 0.11
Nodes (27): CompetitorActionModuleProps, IdeaActionModulesProps, PitchSimulationActionModuleProps, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams, TestHarness() (+19 more)

### Community 9 - "expo"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, projectId (+18 more)

### Community 10 - "steps"
Cohesion: 0.08
Nodes (26): concurrency, cancel-in-progress, group, EXPO_PUBLIC_API_URL, jobs, validate, name, on (+18 more)

### Community 11 - "react-test-renderer"
Cohesion: 0.13
Nodes (17): react-test-renderer, mockNavigate, mockNavigate, TestHarness(), TestHarness(), TestHarness(), usePitchDeck(), UsePitchDeckOptions (+9 more)

### Community 12 - "package.json"
Cohesion: 0.12
Nodes (22): devDependencies, jest@~30.5.2, jest-expo@~58.0.15, react-test-renderer@^19.3.0, @testing-library/react-native@^14.1.0, @types/jest@30.0.0, @types/node@^26.6.5, @types/react@~19.3.0 (+14 more)

### Community 13 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, expo@~58.0.26, expo-font@^58.0.12, expo-print@~58.0.9, expo-secure-store@~58.0.3, expo-sharing@~58.0.23, expo-status-bar@~58.0.5, react@19.3.0 (+15 more)

### Community 14 - "pdfExport.ts"
Cohesion: 0.20
Nodes (14): ExportPitchDeckDownloadInfo, ExportPitchDeckOptions, exportPitchDeckPdf(), ExportPitchDeckResult, formatDownloadLocation(), generateDownloadFilename(), PdfValidationResult, sanitizePdfFilename() (+6 more)

### Community 15 - "ProfileScreen.test.tsx"
Cohesion: 0.11
Nodes (16): mockRefreshUser, mockSignOut, mockUser, mockGoBack, mockNavigate, mockRefreshUser, mockGoBack, mockNavigate (+8 more)

### Community 16 - "react"
Cohesion: 0.25
Nodes (7): react, LUCIDE_NAME_MAP, iconStyles, IconName, IconProps, IconRenderProps, SettingRowProps

### Community 17 - "updates"
Cohesion: 0.12
Nodes (15): prefix, patterns, development-dependencies, day, interval, time, timezone, updates (+7 more)

### Community 18 - "env.ts"
Cohesion: 0.17
Nodes (8): { withAndroidManifest }, AppConfig, config, DEFAULT_API_URL, getAppConfig(), getDefaultApiUrl(), isDemoTopUpEnabled(), sanitizeApiUrl()

### Community 19 - "apiClient.ts"
Cohesion: 0.27
Nodes (8): RFC-4122, AI_GENERATION_TIMEOUT_MS, apiClient, ApiErrorCode, DEFAULT_TIMEOUT_MS, generateRequestId(), setUnauthorizedHandler(), UnauthorizedHandler

### Community 20 - "CanvasScreen.generation.test.tsx"
Cohesion: 0.18
Nodes (12): expo-clipboard@~58.0.4, expo-clipboard, sampleIdeaWithCanvas, sampleIdeaWithoutCanvas, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+4 more)

### Community 21 - "IdeaDetailsScreen.modules.test.tsx"
Cohesion: 0.18
Nodes (12): fullIdeaFixture, ideaWithCanvasFixture, ideaWithoutCanvasFixture, ideaWithoutDeckFixture, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+4 more)

### Community 22 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+4 more)

### Community 23 - "useValidateIdea.ts"
Cohesion: 0.27
Nodes (9): ANALYZING_STEPS, MAX_IDEA_LENGTH, MIN_IDEA_LENGTH, ModalStage, TIPS, ValidateTip, TestHarness(), useValidateIdea() (+1 more)

### Community 24 - "downloadStorage.ts"
Cohesion: 0.42
Nodes (8): clearStoredDownloadDirectoryUri(), DOWNLOAD_DIRECTORY_URI_KEY, getStoredDownloadDirectoryUri(), isSecureStoreAvailable(), memoryStore, _resetMemoryStoreForTesting(), saveDownloadDirectoryUri(), getOrRequestDownloadsDirectoryUri()

### Community 25 - "expo-file-system"
Cohesion: 0.25
Nodes (4): expo-file-system@~58.0.14, expo-file-system, validatePdfFile(), MockFile

### Community 26 - "ApiError"
Cohesion: 0.39
Nodes (5): TestHarness(), TestHarness(), useCanvas(), UseCanvasOptions, ApiError

### Community 27 - "PitchSimulatorScreen.test.tsx"
Cohesion: 0.29
Nodes (6): mockGoBack, mockIdeaWithoutSimulation, mockNavigate, mockRefreshUser, mockRouteParams, mockSimulatedQuestions

### Community 28 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

### Community 30 - "CompetitorScreen.test.tsx"
Cohesion: 0.33
Nodes (5): mockGoBack, mockIdeaWithCompetitors, mockNavigate, mockRefreshUser, mockRouteParams

## Knowledge Gaps
- **2 isolated node(s):** `RFC-4122`, `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 309 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `Icon`, `HomeScreen.tsx`, `AuthContext.tsx`, `RootNavigator.tsx`, `SignInScreen.tsx`, `PitchDeckScreen.tsx`, `ideasApi.ts`, `react-test-renderer`, `package.json`, `dependencies`, `pdfExport.ts`, `ProfileScreen.test.tsx`, `react`, `env.ts`, `CanvasScreen.generation.test.tsx`, `IdeaDetailsScreen.modules.test.tsx`, `downloadStorage.ts`, `ApiError`, `PitchSimulatorScreen.test.tsx`, `CompetitorScreen.test.tsx`?**
  _High betweenness centrality (0.225) - this node is a cross-community bridge._
- **What connects `RFC-4122`, `expo/tsconfig.base` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `Icon` be split into smaller, more focused modules?**
  _Cohesion score 0.08110944527736132 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `Icon`, `react-native`, `HomeScreen.tsx`, `AuthContext.tsx`, `RootNavigator.tsx`, `SignInScreen.tsx`, `PitchDeckScreen.tsx`, `ideasApi.ts`, `react-test-renderer`, `package.json`, `dependencies`, `ProfileScreen.test.tsx`, `CanvasScreen.generation.test.tsx`, `IdeaDetailsScreen.modules.test.tsx`, `useValidateIdea.ts`, `ApiError`, `PitchSimulatorScreen.test.tsx`, `CompetitorScreen.test.tsx`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **Should `react-native` be split into smaller, more focused modules?**
  _Cohesion score 0.05863316200266514 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Should `HomeScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.057342657342657345 - nodes in this community are weakly interconnected._