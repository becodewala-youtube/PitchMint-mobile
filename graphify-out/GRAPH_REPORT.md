# Graph Report - PitchMint-mobile  (2026-11-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 824 nodes · 2843 edges · 31 communities (29 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a5928379`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Icon
- react-native
- AuthContext.tsx
- SignInScreen.tsx
- with
- RootNavigator.tsx
- CanvasScreen.tsx
- react
- expo
- steps
- HomeScreen.tsx
- package.json
- ApiError
- ideasApi.ts
- PitchDeckScreen.tsx
- react-test-renderer
- apiClient.ts
- updates
- ActivityScreen.tsx
- IdeaDetailsScreen.modules.test.tsx
- dependencies
- env.ts
- scripts
- usePitchDeck.ts
- useValidateIdea.ts
- useIdeaDetails.recovery.test.tsx
- tsconfig.json
- AppErrorBoundary
- PitchDeckScreen.test.tsx
- App.tsx

## God Nodes (most connected - your core abstractions)
1. `react-native` - 119 edges
2. `react` - 103 edges
3. `Icon()` - 84 edges
4. `Card()` - 64 edges
5. `IconBadge()` - 51 edges
6. `Button()` - 43 edges
7. `ApiError` - 30 edges
8. `react-test-renderer` - 30 edges
9. `Pill()` - 29 edges
10. `useAuth()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `ValidateTip` --references--> `IconName`  [EXTRACTED]
  src/features/validate/constants/validateConstants.ts → src/components/icons/types.ts
- `IdeasScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/ideas/screens/IdeasScreen.tsx → src/services/api/ideasApi.ts
- `HomeScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/home/screens/HomeScreen.tsx → src/services/api/ideasApi.ts
- `CompetitorCardProps` --references--> `CompetitorItem`  [EXTRACTED]
  src/features/competitors/components/CompetitorCard.tsx → src/services/api/ideasApi.types.ts
- `SwotMatrixViewProps` --references--> `CompetitorItem`  [EXTRACTED]
  src/features/competitors/components/SwotMatrixView.tsx → src/services/api/ideasApi.types.ts

## Import Cycles
- None detected.

## Communities (31 total, 2 thin omitted)

### Community 0 - "Icon"
Cohesion: 0.08
Nodes (72): Badge(), Button(), Card(), CreditConfirmationModal(), DeleteConfirmationModal(), Icon(), IconBadge(), IdeaCard() (+64 more)

### Community 1 - "react-native"
Cohesion: 0.06
Nodes (55): react-native, react-native-safe-area-context, AppProviders(), AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles, AuthCardProps (+47 more)

### Community 2 - "AuthContext.tsx"
Cohesion: 0.07
Nodes (35): GoogleLogo(), GoogleSignInButtonProps, styles, AuthContextType, AuthProvider(), logAuthWarning(), createAuthTestRenderer(), createDeferred() (+27 more)

### Community 3 - "SignInScreen.tsx"
Cohesion: 0.11
Nodes (36): @react-navigation/native, @react-navigation/native-stack, AuthCard(), GoogleSignInButton(), Input(), useAuth(), EmailVerificationNavigationProp, EmailVerificationRouteProp (+28 more)

### Community 4 - "with"
Cohesion: 0.05
Nodes (46): if, name, needs, permissions, runs-on, steps, concurrency, cancel-in-progress (+38 more)

### Community 5 - "RootNavigator.tsx"
Cohesion: 0.09
Nodes (22): expo-secure-store, AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider(), useOnboarding(), AuthLoadingScreen(), OnboardingScreen() (+14 more)

### Community 6 - "CanvasScreen.tsx"
Cohesion: 0.11
Nodes (22): expo-clipboard@~58.0.4, expo-clipboard, CanvasBlockSelector(), CanvasBlockSelectorProps, CanvasBlockViewerProps, CANVAS_BLOCK_DEFINITIONS, CanvasBlockDefinition, TestHarness() (+14 more)

### Community 7 - "react"
Cohesion: 0.15
Nodes (20): react, renderActionIcon(), iconStyles, renderMediaIcon(), renderNavigationIcon(), renderStatusIcon(), IconName, IconProps (+12 more)

### Community 8 - "expo"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, projectId (+18 more)

### Community 9 - "steps"
Cohesion: 0.08
Nodes (26): concurrency, cancel-in-progress, group, EXPO_PUBLIC_API_URL, jobs, validate, name, on (+18 more)

### Community 10 - "HomeScreen.tsx"
Cohesion: 0.15
Nodes (14): IdeaCardProps, ideaCardStyles, SectionHeader(), HomeHeader(), HomeHeaderProps, HomeQuickActions(), HomeQuickActionsProps, HomeScreen() (+6 more)

### Community 11 - "package.json"
Cohesion: 0.12
Nodes (22): devDependencies, jest@~30.5.2, jest-expo@~58.0.14, react-test-renderer@^19.3.0, @testing-library/react-native@^14.1.0, @types/jest@30.0.0, @types/node@^26.6.5, @types/react@~19.3.0 (+14 more)

### Community 12 - "ApiError"
Cohesion: 0.11
Nodes (18): config, mockRefreshUser, mockSignOut, mockUser, mockGoBack, mockNavigate, mockRefreshUser, mockGoBack (+10 more)

### Community 13 - "ideasApi.ts"
Cohesion: 0.17
Nodes (19): CompetitorActionModuleProps, IdeaActionModulesProps, PitchSimulationActionModuleProps, UseIdeaDetailsResult, BackendIdea, CanvasContentData, CanvasResponse, CompetitorAnalysisResponse (+11 more)

### Community 14 - "PitchDeckScreen.tsx"
Cohesion: 0.20
Nodes (13): expo-print, expo-sharing, PitchDeckSlideStrip(), PitchDeckSlideStripProps, PitchDeckSlideViewerProps, SLIDE_DEFINITIONS, SlideDefinition, PitchDeckRouteProp (+5 more)

### Community 15 - "react-test-renderer"
Cohesion: 0.12
Nodes (15): react-test-renderer, UseCanvasOptions, mockGoBack, mockIdeaWithCompetitors, mockNavigate, mockRefreshUser, mockRouteParams, mockNavigate (+7 more)

### Community 16 - "apiClient.ts"
Cohesion: 0.22
Nodes (10): RFC-4122, AI_GENERATION_TIMEOUT_MS, apiClient, ApiErrorCode, DEFAULT_TIMEOUT_MS, generateIdempotencyKey(), generateRequestId(), setUnauthorizedHandler() (+2 more)

### Community 17 - "updates"
Cohesion: 0.12
Nodes (15): prefix, patterns, development-dependencies, day, interval, time, timezone, updates (+7 more)

### Community 18 - "ActivityScreen.tsx"
Cohesion: 0.27
Nodes (10): ActivityScreen(), getServiceVisuals(), styles, activityApi, ActivityHistoryItem, BackendServiceType, GetActivityHistoryParams, formatDisplayDate() (+2 more)

### Community 19 - "IdeaDetailsScreen.modules.test.tsx"
Cohesion: 0.17
Nodes (12): fullIdeaFixture, ideaWithCanvasFixture, ideaWithoutCanvasFixture, ideaWithoutDeckFixture, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+4 more)

### Community 20 - "dependencies"
Cohesion: 0.13
Nodes (15): dependencies, expo-print@~58.0.9, expo-secure-store@~58.0.3, expo-sharing@~58.0.23, expo-status-bar@~58.0.5, react@19.3.0, react-native@0.88.1, react-native-safe-area-context@~5.11.1 (+7 more)

### Community 21 - "env.ts"
Cohesion: 0.18
Nodes (7): { withAndroidManifest }, AppConfig, DEFAULT_API_URL, getAppConfig(), getDefaultApiUrl(), isDemoTopUpEnabled(), sanitizeApiUrl()

### Community 22 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+4 more)

### Community 23 - "usePitchDeck.ts"
Cohesion: 0.27
Nodes (6): TestHarness(), TestHarness(), usePitchDeck(), UsePitchDeckOptions, mapBackendIdeaToCard(), hasSubDocument()

### Community 24 - "useValidateIdea.ts"
Cohesion: 0.27
Nodes (9): ANALYZING_STEPS, MAX_IDEA_LENGTH, MIN_IDEA_LENGTH, ModalStage, TIPS, ValidateTip, TestHarness(), useValidateIdea() (+1 more)

### Community 25 - "useIdeaDetails.recovery.test.tsx"
Cohesion: 0.33
Nodes (6): mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams, TestHarness(), useIdeaDetails()

### Community 26 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

### Community 28 - "PitchDeckScreen.test.tsx"
Cohesion: 0.33
Nodes (4): mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams

### Community 29 - "App.tsx"
Cohesion: 0.50
Nodes (3): expo@~58.0.25, expo, App()

## Knowledge Gaps
- **2 isolated node(s):** `RFC-4122`, `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 280 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `Icon`, `AuthContext.tsx`, `SignInScreen.tsx`, `RootNavigator.tsx`, `CanvasScreen.tsx`, `react`, `HomeScreen.tsx`, `package.json`, `ApiError`, `ideasApi.ts`, `PitchDeckScreen.tsx`, `react-test-renderer`, `ActivityScreen.tsx`, `IdeaDetailsScreen.modules.test.tsx`, `dependencies`, `env.ts`, `usePitchDeck.ts`, `useIdeaDetails.recovery.test.tsx`, `PitchDeckScreen.test.tsx`?**
  _High betweenness centrality (0.181) - this node is a cross-community bridge._
- **What connects `RFC-4122`, `expo/tsconfig.base` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `Icon` be split into smaller, more focused modules?**
  _Cohesion score 0.0769121207805156 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `Icon`, `react-native`, `AuthContext.tsx`, `SignInScreen.tsx`, `RootNavigator.tsx`, `CanvasScreen.tsx`, `HomeScreen.tsx`, `package.json`, `ApiError`, `ideasApi.ts`, `PitchDeckScreen.tsx`, `react-test-renderer`, `ActivityScreen.tsx`, `IdeaDetailsScreen.modules.test.tsx`, `dependencies`, `usePitchDeck.ts`, `useValidateIdea.ts`, `useIdeaDetails.recovery.test.tsx`, `PitchDeckScreen.test.tsx`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **Should `react-native` be split into smaller, more focused modules?**
  _Cohesion score 0.057871692366266894 - nodes in this community are weakly interconnected._
- **Why does `Icon()` connect `Icon` to `react-native`, `SignInScreen.tsx`, `RootNavigator.tsx`, `CanvasScreen.tsx`, `react`, `HomeScreen.tsx`, `PitchDeckScreen.tsx`, `ActivityScreen.tsx`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Should `AuthContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07390648567119155 - nodes in this community are weakly interconnected._