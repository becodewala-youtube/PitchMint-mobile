# Graph Report - PitchMint-mobile  (2026-11-21)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 903 nodes · 2975 edges · 36 communities (34 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `89bf72c7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Icon
- react-native
- ideasApi.ts
- RootNavigator.tsx
- HomeScreen.tsx
- SignInScreen.tsx
- with
- ProfileScreen.tsx
- expo
- steps
- AuthContext.tsx
- PitchDeckScreen.tsx
- package.json
- dependencies
- react
- ValidateModalScreen.tsx
- apiClient.ts
- Icon.tsx
- creditsApi.ts
- updates
- CanvasScreen.generation.test.tsx
- IdeaDetailsScreen.modules.test.tsx
- pdfExport.ts
- pdfExport.test.ts
- PitchDeckScreen.test.tsx
- scripts
- tokenStorage.ts
- downloadStorage.ts
- TokenStorageError
- PitchDeckSlideViewer.tsx
- expo-file-system
- tsconfig.json
- AppErrorBoundary
- GoogleSignInButton.tsx
- signInScreen.test.tsx

## God Nodes (most connected - your core abstractions)
1. `react-native` - 130 edges
2. `react` - 114 edges
3. `Icon()` - 65 edges
4. `Card()` - 46 edges
5. `react-test-renderer` - 40 edges
6. `Button()` - 39 edges
7. `IconBadge()` - 39 edges
8. `ideasApi` - 33 edges
9. `useAuth()` - 31 edges
10. `ApiError` - 30 edges

## Surprising Connections (you probably didn't know these)
- `ValidateTip` --references--> `IconName`  [EXTRACTED]
  src/features/validate/constants/validateConstants.ts → src/components/icons/types.ts
- `HomeScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/home/screens/HomeScreen.tsx → src/services/api/ideasApi.ts
- `IdeasScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/ideas/screens/IdeasScreen.tsx → src/services/api/ideasApi.ts
- `CanvasBlockSelectorProps` --references--> `CanvasBlockDefinition`  [EXTRACTED]
  src/features/canvas/components/CanvasBlockSelector.tsx → src/features/canvas/constants/blockDefinitions.ts
- `CanvasBlockViewerProps` --references--> `CanvasBlockDefinition`  [EXTRACTED]
  src/features/canvas/components/CanvasBlockViewer.tsx → src/features/canvas/constants/blockDefinitions.ts

## Import Cycles
- None detected.

## Communities (36 total, 2 thin omitted)

### Community 0 - "Icon"
Cohesion: 0.10
Nodes (57): Badge(), Button(), Card(), CreditConfirmationModal(), DeleteConfirmationModal(), Icon(), IconBadge(), IdeaCard() (+49 more)

### Community 1 - "react-native"
Cohesion: 0.06
Nodes (50): react-native, App(), AppProviders(), AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles, AuthCardProps (+42 more)

### Community 2 - "ideasApi.ts"
Cohesion: 0.05
Nodes (50): IdeaCardProps, ideaCardStyles, CANVAS_BLOCK_DEFINITIONS, TestHarness(), TestHarness(), useCanvas(), UseCanvasOptions, formatCanvasAsMarkdown() (+42 more)

### Community 3 - "RootNavigator.tsx"
Cohesion: 0.06
Nodes (33): expo-secure-store, AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider(), useOnboarding(), AuthLoadingScreen(), ChatVisual() (+25 more)

### Community 4 - "HomeScreen.tsx"
Cohesion: 0.08
Nodes (30): ActivityScreen(), getServiceVisuals(), styles, HomeHeader(), HomeHeaderProps, HomeQuickActions(), HomeQuickActionsProps, HomeScreen() (+22 more)

### Community 5 - "SignInScreen.tsx"
Cohesion: 0.10
Nodes (35): @react-navigation/native, @react-navigation/native-stack, AuthCard(), Input(), EmailVerificationNavigationProp, EmailVerificationRouteProp, EmailVerificationScreen(), styles (+27 more)

### Community 6 - "with"
Cohesion: 0.05
Nodes (46): if, name, needs, permissions, runs-on, steps, concurrency, cancel-in-progress (+38 more)

### Community 7 - "ProfileScreen.tsx"
Cohesion: 0.10
Nodes (21): { withAndroidManifest }, AppConfig, config, DEFAULT_API_URL, getAppConfig(), getDefaultApiUrl(), isDemoTopUpEnabled(), sanitizeApiUrl() (+13 more)

### Community 8 - "expo"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, projectId (+18 more)

### Community 9 - "steps"
Cohesion: 0.08
Nodes (26): concurrency, cancel-in-progress, group, EXPO_PUBLIC_API_URL, jobs, validate, name, on (+18 more)

### Community 10 - "AuthContext.tsx"
Cohesion: 0.16
Nodes (19): AuthContextType, logAuthWarning(), authApi, AuthSuccessResponse, ForgotPasswordParams, GoogleAuthParams, MessageResponse, RegisterParams (+11 more)

### Community 11 - "PitchDeckScreen.tsx"
Cohesion: 0.19
Nodes (13): PitchDeckSlideStrip(), PitchDeckSlideStripProps, PitchDeckSlideViewerProps, SLIDE_DEFINITIONS, SlideDefinition, TestHarness(), TestHarness(), TestHarness() (+5 more)

### Community 12 - "package.json"
Cohesion: 0.12
Nodes (22): devDependencies, jest@~30.5.2, jest-expo@~58.0.15, react-test-renderer@^19.3.0, @testing-library/react-native@^14.1.0, @types/jest@30.0.0, @types/node@^26.6.5, @types/react@~19.3.0 (+14 more)

### Community 13 - "dependencies"
Cohesion: 0.10
Nodes (20): dependencies, expo@~58.0.26, expo-font@^58.0.12, expo-secure-store@~58.0.3, expo-status-bar@~58.0.5, react@19.3.0, react-native@0.88.1, react-native-safe-area-context@~5.11.1 (+12 more)

### Community 14 - "react"
Cohesion: 0.15
Nodes (12): react, react-test-renderer, mockNavigate, mockRefreshUser, mockUser, mockNavigate, mockRefreshUser, mockUser (+4 more)

### Community 15 - "ValidateModalScreen.tsx"
Cohesion: 0.20
Nodes (13): ValidateAnalyzingStage(), ValidateAnalyzingStageProps, ANALYZING_STEPS, MAX_IDEA_LENGTH, MIN_IDEA_LENGTH, ModalStage, TIPS, ValidateTip (+5 more)

### Community 16 - "apiClient.ts"
Cohesion: 0.23
Nodes (10): RFC-4122, AI_GENERATION_TIMEOUT_MS, apiClient, ApiErrorCode, DEFAULT_TIMEOUT_MS, generateIdempotencyKey(), generateRequestId(), setUnauthorizedHandler() (+2 more)

### Community 17 - "Icon.tsx"
Cohesion: 0.24
Nodes (6): LUCIDE_NAME_MAP, iconStyles, IconName, IconProps, IconRenderProps, SettingRowProps

### Community 18 - "creditsApi.ts"
Cohesion: 0.12
Nodes (14): ValidateResultsStageProps, mockGoBack, mockNavigate, mockRefreshUser, mockGoBack, mockNavigate, mockRefreshUser, RequestOptions (+6 more)

### Community 19 - "updates"
Cohesion: 0.12
Nodes (15): prefix, patterns, development-dependencies, day, interval, time, timezone, updates (+7 more)

### Community 20 - "CanvasScreen.generation.test.tsx"
Cohesion: 0.18
Nodes (12): expo-clipboard@~58.0.4, expo-clipboard, sampleIdeaWithCanvas, sampleIdeaWithoutCanvas, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+4 more)

### Community 21 - "IdeaDetailsScreen.modules.test.tsx"
Cohesion: 0.18
Nodes (12): fullIdeaFixture, ideaWithCanvasFixture, ideaWithoutCanvasFixture, ideaWithoutDeckFixture, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+4 more)

### Community 22 - "pdfExport.ts"
Cohesion: 0.27
Nodes (9): ExportPitchDeckDownloadInfo, ExportPitchDeckOptions, ExportPitchDeckResult, PdfValidationResult, escapeHtml(), formatSlideBody(), generatePitchDeckHtml(), PDF_PAGE_HEIGHT (+1 more)

### Community 23 - "pdfExport.test.ts"
Cohesion: 0.19
Nodes (10): expo-print@~58.0.9, expo-sharing@~58.0.23, expo-print, expo-sharing, exportPitchDeckPdf(), formatDownloadLocation(), generateDownloadFilename(), sanitizePdfFilename() (+2 more)

### Community 24 - "PitchDeckScreen.test.tsx"
Cohesion: 0.15
Nodes (8): mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams

### Community 25 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+4 more)

### Community 26 - "tokenStorage.ts"
Cohesion: 0.20
Nodes (5): AUTH_TOKEN_KEY, memoryStore, _resetMemoryStoreForTesting(), TokenStorageErrorCode, TokenStorageService

### Community 27 - "downloadStorage.ts"
Cohesion: 0.42
Nodes (8): clearStoredDownloadDirectoryUri(), DOWNLOAD_DIRECTORY_URI_KEY, getStoredDownloadDirectoryUri(), isSecureStoreAvailable(), memoryStore, _resetMemoryStoreForTesting(), saveDownloadDirectoryUri(), getOrRequestDownloadsDirectoryUri()

### Community 28 - "TokenStorageError"
Cohesion: 0.44
Nodes (5): AuthProvider(), createAuthTestRenderer(), createDeferred(), mockUser, TokenStorageError

### Community 29 - "PitchDeckSlideViewer.tsx"
Cohesion: 0.39
Nodes (5): PitchDeckControls(), PitchDeckSlideViewer(), SLIDE_TONE_BACKGROUNDS, formatSlideContent(), SlideContentBlock

### Community 30 - "expo-file-system"
Cohesion: 0.25
Nodes (4): expo-file-system@~58.0.14, expo-file-system, validatePdfFile(), MockFile

### Community 31 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

### Community 33 - "GoogleSignInButton.tsx"
Cohesion: 0.50
Nodes (4): GoogleLogo(), GoogleSignInButton(), GoogleSignInButtonProps, styles

### Community 34 - "signInScreen.test.tsx"
Cohesion: 0.40
Nodes (4): mockClearError, mockNavigate, mockRouteParams, mockSignIn

## Knowledge Gaps
- **2 isolated node(s):** `RFC-4122`, `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 313 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `Icon`, `ideasApi.ts`, `RootNavigator.tsx`, `HomeScreen.tsx`, `SignInScreen.tsx`, `ProfileScreen.tsx`, `AuthContext.tsx`, `PitchDeckScreen.tsx`, `package.json`, `dependencies`, `react`, `ValidateModalScreen.tsx`, `Icon.tsx`, `creditsApi.ts`, `CanvasScreen.generation.test.tsx`, `IdeaDetailsScreen.modules.test.tsx`, `pdfExport.ts`, `pdfExport.test.ts`, `PitchDeckScreen.test.tsx`, `tokenStorage.ts`, `downloadStorage.ts`, `PitchDeckSlideViewer.tsx`, `GoogleSignInButton.tsx`, `signInScreen.test.tsx`?**
  _High betweenness centrality (0.226) - this node is a cross-community bridge._
- **What connects `RFC-4122`, `expo/tsconfig.base` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `Icon` be split into smaller, more focused modules?**
  _Cohesion score 0.0993421052631579 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `Icon`, `react-native`, `ideasApi.ts`, `RootNavigator.tsx`, `HomeScreen.tsx`, `SignInScreen.tsx`, `ProfileScreen.tsx`, `AuthContext.tsx`, `PitchDeckScreen.tsx`, `package.json`, `dependencies`, `ValidateModalScreen.tsx`, `Icon.tsx`, `creditsApi.ts`, `CanvasScreen.generation.test.tsx`, `IdeaDetailsScreen.modules.test.tsx`, `PitchDeckScreen.test.tsx`, `TokenStorageError`, `PitchDeckSlideViewer.tsx`, `GoogleSignInButton.tsx`, `signInScreen.test.tsx`?**
  _High betweenness centrality (0.137) - this node is a cross-community bridge._
- **Should `react-native` be split into smaller, more focused modules?**
  _Cohesion score 0.064501679731243 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Should `ideasApi.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05328218243819267 - nodes in this community are weakly interconnected._