# Graph Report - PitchMint-mobile  (2026-11-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 831 nodes · 2821 edges · 36 communities (32 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d0061d9c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Icon
- react-native
- HomeScreen.tsx
- RootNavigator.tsx
- with
- react
- apiClient.ts
- ValidateResultsStage.tsx
- expo
- steps
- SignInScreen.tsx
- package.json
- AuthContext.tsx
- PitchDeckScreen.tsx
- useAuth
- IdeasScreen.tsx
- ideasApi.ts
- tokenStorage.ts
- dependencies
- updates
- CanvasScreen.generation.test.tsx
- useCanvas.ts
- IdeaDetailsScreen.modules.test.tsx
- useIdeaDetails.ts
- scripts
- GoogleSignInButton.tsx
- react-test-renderer
- PitchSimulatorScreen.test.tsx
- ideasApi
- tsconfig.json
- AppErrorBoundary
- CompetitorScreen.test.tsx
- PitchDeckScreen.test.tsx
- expo
- @react-native-vector-icons/lucide

## God Nodes (most connected - your core abstractions)
1. `react-native` - 119 edges
2. `react` - 104 edges
3. `Icon()` - 79 edges
4. `Card()` - 60 edges
5. `IconBadge()` - 45 edges
6. `Button()` - 43 edges
7. `react-test-renderer` - 31 edges
8. `ApiError` - 30 edges
9. `useAuth()` - 29 edges
10. `ideasApi` - 29 edges

## Surprising Connections (you probably didn't know these)
- `SettingRowProps` --references--> `IconName`  [EXTRACTED]
  src/features/profile/components/SettingRow.tsx → src/components/icons/types.ts
- `ValidateTip` --references--> `IconName`  [EXTRACTED]
  src/features/validate/constants/validateConstants.ts → src/components/icons/types.ts
- `IdeasScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/ideas/screens/IdeasScreen.tsx → src/services/api/ideasApi.ts
- `HomeScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/home/screens/HomeScreen.tsx → src/services/api/ideasApi.ts
- `AuthProvider()` --calls--> `TokenStorageError`  [EXTRACTED]
  src/context/AuthContext.tsx → src/services/storage/tokenStorage.ts

## Import Cycles
- None detected.

## Communities (36 total, 4 thin omitted)

### Community 0 - "Icon"
Cohesion: 0.09
Nodes (59): Badge(), Button(), Card(), CreditConfirmationModal(), DeleteConfirmationModal(), Icon(), IconBadge(), Pill() (+51 more)

### Community 1 - "react-native"
Cohesion: 0.07
Nodes (48): react-native, react-native-safe-area-context, App(), AppProviders(), AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles (+40 more)

### Community 2 - "HomeScreen.tsx"
Cohesion: 0.07
Nodes (27): { withAndroidManifest }, AppConfig, DEFAULT_API_URL, getAppConfig(), getDefaultApiUrl(), isDemoTopUpEnabled(), sanitizeApiUrl(), ActivityScreen() (+19 more)

### Community 3 - "RootNavigator.tsx"
Cohesion: 0.07
Nodes (29): expo-secure-store, AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider(), useOnboarding(), AuthLoadingScreen(), OnboardingScreen() (+21 more)

### Community 4 - "with"
Cohesion: 0.05
Nodes (46): if, name, needs, permissions, runs-on, steps, concurrency, cancel-in-progress (+38 more)

### Community 5 - "react"
Cohesion: 0.13
Nodes (16): react, LUCIDE_NAME_MAP, iconStyles, IconName, IconProps, IconRenderProps, ChatVisual(), DeckVisual() (+8 more)

### Community 6 - "apiClient.ts"
Cohesion: 0.12
Nodes (20): RFC-4122, config, mockRefreshUser, mockSignOut, mockUser, AI_GENERATION_TIMEOUT_MS, apiClient, ApiError (+12 more)

### Community 7 - "ValidateResultsStage.tsx"
Cohesion: 0.11
Nodes (20): ScoreBar(), ValidateAnalyzingStage(), ValidateAnalyzingStageProps, ValidateResultsStage(), ValidateResultsStageProps, ANALYZING_STEPS, MAX_IDEA_LENGTH, MIN_IDEA_LENGTH (+12 more)

### Community 8 - "expo"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, projectId (+18 more)

### Community 9 - "steps"
Cohesion: 0.08
Nodes (26): concurrency, cancel-in-progress, group, EXPO_PUBLIC_API_URL, jobs, validate, name, on (+18 more)

### Community 10 - "SignInScreen.tsx"
Cohesion: 0.14
Nodes (17): @react-navigation/native, @react-navigation/native-stack, EmailVerificationNavigationProp, EmailVerificationRouteProp, EmailVerificationScreen(), styles, ForgotPasswordNavigationProp, ForgotPasswordRouteProp (+9 more)

### Community 11 - "package.json"
Cohesion: 0.12
Nodes (22): devDependencies, jest@~30.5.2, jest-expo@~58.0.14, react-test-renderer@^19.3.0, @testing-library/react-native@^14.1.0, @types/jest@30.0.0, @types/node@^26.6.5, @types/react@~19.3.0 (+14 more)

### Community 12 - "AuthContext.tsx"
Cohesion: 0.21
Nodes (17): AuthContextType, AuthProvider(), logAuthWarning(), createAuthTestRenderer(), createDeferred(), mockUser, authApi, ForgotPasswordParams (+9 more)

### Community 13 - "PitchDeckScreen.tsx"
Cohesion: 0.21
Nodes (14): expo-print, expo-sharing, PitchDeckSlideStrip(), PitchDeckSlideStripProps, PitchDeckSlideViewer(), PitchDeckSlideViewerProps, SLIDE_DEFINITIONS, SlideDefinition (+6 more)

### Community 14 - "useAuth"
Cohesion: 0.21
Nodes (18): AuthCard(), GoogleSignInButton(), Input(), useAuth(), ForgotPasswordScreen(), ResetPasswordNavigationProp, ResetPasswordRouteProp, ResetPasswordScreen() (+10 more)

### Community 15 - "IdeasScreen.tsx"
Cohesion: 0.15
Nodes (16): IdeaCard(), IdeaCardProps, ideaCardStyles, getScoreColor(), ScoreRing(), ScoreRingProps, styles, IdeasPagination() (+8 more)

### Community 16 - "ideasApi.ts"
Cohesion: 0.15
Nodes (19): CompetitorActionModuleProps, IdeaActionModulesProps, PitchSimulationActionModuleProps, UseIdeaDetailsResult, BackendIdea, CanvasContentData, CanvasResponse, CompetitorAnalysisResponse (+11 more)

### Community 17 - "tokenStorage.ts"
Cohesion: 0.12
Nodes (11): SignInScreen(), mockClearError, mockNavigate, mockRouteParams, mockSignIn, AUTH_TOKEN_KEY, memoryStore, _resetMemoryStoreForTesting() (+3 more)

### Community 18 - "dependencies"
Cohesion: 0.12
Nodes (17): dependencies, expo-font@^58.0.12, expo-print@~58.0.9, expo-secure-store@~58.0.3, expo-sharing@~58.0.23, expo-status-bar@~58.0.5, react@19.3.0, react-native@0.88.1 (+9 more)

### Community 19 - "updates"
Cohesion: 0.12
Nodes (15): prefix, patterns, development-dependencies, day, interval, time, timezone, updates (+7 more)

### Community 20 - "CanvasScreen.generation.test.tsx"
Cohesion: 0.17
Nodes (12): expo-clipboard@~58.0.4, expo-clipboard, sampleIdeaWithCanvas, sampleIdeaWithoutCanvas, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+4 more)

### Community 21 - "useCanvas.ts"
Cohesion: 0.24
Nodes (6): CANVAS_BLOCK_DEFINITIONS, TestHarness(), TestHarness(), useCanvas(), UseCanvasOptions, formatCanvasAsMarkdown()

### Community 22 - "IdeaDetailsScreen.modules.test.tsx"
Cohesion: 0.18
Nodes (12): fullIdeaFixture, ideaWithCanvasFixture, ideaWithoutCanvasFixture, ideaWithoutDeckFixture, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+4 more)

### Community 23 - "useIdeaDetails.ts"
Cohesion: 0.25
Nodes (10): mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams, TestHarness(), useIdeaDetails(), generateIdempotencyKey(), mapBackendIdeaToCard() (+2 more)

### Community 24 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+4 more)

### Community 25 - "GoogleSignInButton.tsx"
Cohesion: 0.24
Nodes (8): GoogleLogo(), GoogleSignInButtonProps, styles, AuthSuccessResponse, checkGoogleSignInStatus(), googleAuthService, GoogleSignInConfig, GoogleSignInStatus

### Community 26 - "react-test-renderer"
Cohesion: 0.42
Nodes (5): react-test-renderer, TestHarness(), TestHarness(), usePitchDeck(), UsePitchDeckOptions

### Community 27 - "PitchSimulatorScreen.test.tsx"
Cohesion: 0.29
Nodes (6): mockGoBack, mockIdeaWithoutSimulation, mockNavigate, mockRefreshUser, mockRouteParams, mockSimulatedQuestions

### Community 28 - "ideasApi"
Cohesion: 0.52
Nodes (5): TestHarness(), useValidateIdea(), UseValidateIdeaOptions, ideasApi, SubmitIdeaResponse

### Community 29 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

### Community 31 - "CompetitorScreen.test.tsx"
Cohesion: 0.33
Nodes (5): mockGoBack, mockIdeaWithCompetitors, mockNavigate, mockRefreshUser, mockRouteParams

### Community 32 - "PitchDeckScreen.test.tsx"
Cohesion: 0.33
Nodes (4): mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams

## Knowledge Gaps
- **2 isolated node(s):** `expo/tsconfig.base`, `RFC-4122`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 285 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `Icon`, `HomeScreen.tsx`, `RootNavigator.tsx`, `react`, `apiClient.ts`, `ValidateResultsStage.tsx`, `SignInScreen.tsx`, `package.json`, `PitchDeckScreen.tsx`, `useAuth`, `IdeasScreen.tsx`, `tokenStorage.ts`, `dependencies`, `CanvasScreen.generation.test.tsx`, `useCanvas.ts`, `IdeaDetailsScreen.modules.test.tsx`, `useIdeaDetails.ts`, `GoogleSignInButton.tsx`, `react-test-renderer`, `PitchSimulatorScreen.test.tsx`, `CompetitorScreen.test.tsx`, `PitchDeckScreen.test.tsx`?**
  _High betweenness centrality (0.185) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base`, `RFC-4122` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `Icon` be split into smaller, more focused modules?**
  _Cohesion score 0.09207920792079208 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `Icon`, `react-native`, `HomeScreen.tsx`, `RootNavigator.tsx`, `apiClient.ts`, `ValidateResultsStage.tsx`, `SignInScreen.tsx`, `package.json`, `AuthContext.tsx`, `PitchDeckScreen.tsx`, `useAuth`, `IdeasScreen.tsx`, `tokenStorage.ts`, `dependencies`, `CanvasScreen.generation.test.tsx`, `useCanvas.ts`, `IdeaDetailsScreen.modules.test.tsx`, `useIdeaDetails.ts`, `GoogleSignInButton.tsx`, `react-test-renderer`, `PitchSimulatorScreen.test.tsx`, `ideasApi`, `CompetitorScreen.test.tsx`, `PitchDeckScreen.test.tsx`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **Should `react-native` be split into smaller, more focused modules?**
  _Cohesion score 0.06566003202928392 - nodes in this community are weakly interconnected._
- **Why does `Icon()` connect `Icon` to `react-native`, `HomeScreen.tsx`, `RootNavigator.tsx`, `react`, `ValidateResultsStage.tsx`, `SignInScreen.tsx`, `PitchDeckScreen.tsx`, `useAuth`, `IdeasScreen.tsx`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `HomeScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07180851063829788 - nodes in this community are weakly interconnected._