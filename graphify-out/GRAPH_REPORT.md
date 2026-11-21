# Graph Report - PitchMint-mobile  (2026-11-21)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1067 nodes · 3512 edges · 44 communities (43 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c2290195`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- pdfExport.ts
- Icon
- AuthContext.tsx
- SignInScreen.tsx
- with
- ideasApi.ts
- react-native
- AppProviders.tsx
- ValidateModalScreen.tsx
- ActivityScreen.tsx
- react
- expo
- components/index.ts
- steps
- apiClient.ts
- PitchDeckScreen.tsx
- PickIdeaModal.tsx
- package.json
- ProfileScreen.test.tsx
- dependencies
- Icon.tsx
- ApiError
- updates
- CanvasScreen.tsx
- BottomTabNavigator.tsx
- CompetitorScreen.tsx
- IdeaDetailsScreen.modules.test.tsx
- OnboardingScreen.tsx
- CanvasScreen.generation.test.tsx
- onboardingScreens.test.tsx
- src_components_index_icon
- react-native-nitro-google-signin.ts
- RootNavigator.tsx
- scripts
- PitchDeckScreen.test.tsx
- app/App.tsx
- IdeasScreen.tsx
- RootNavigator.test.tsx
- generate-brand-icons.py
- PitchSimulatorScreen.test.tsx
- tsconfig.json
- Button.tsx
- CompetitorScreen.test.tsx

## God Nodes (most connected - your core abstractions)
1. `react-native` - 159 edges
2. `react` - 135 edges
3. `react-test-renderer` - 52 edges
4. `Icon()` - 46 edges
5. `ideasApi` - 42 edges
6. `useAuth()` - 36 edges
7. `Card()` - 35 edges
8. `ApiError` - 33 edges
9. `@react-navigation/native` - 29 edges
10. `IconBadge()` - 28 edges

## Surprising Connections (you probably didn't know these)
- `CompetitorActionModuleProps` --references--> `BackendIdea`  [EXTRACTED]
  src/features/ideas/components/CompetitorActionModule.tsx → src/services/api/ideasApi.types.ts
- `IdeaActionModulesProps` --references--> `BackendIdea`  [EXTRACTED]
  src/features/ideas/components/IdeaActionModules.tsx → src/services/api/ideasApi.types.ts
- `PitchSimulationActionModuleProps` --references--> `BackendIdea`  [EXTRACTED]
  src/features/ideas/components/PitchSimulationActionModule.tsx → src/services/api/ideasApi.types.ts
- `ValidateResultsStageProps` --references--> `SubmitIdeaResponse`  [EXTRACTED]
  src/features/validate/components/ValidateResultsStage.tsx → src/services/api/ideasApi.types.ts
- `IdeasScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/ideas/screens/IdeasScreen.tsx → src/services/api/ideasApi.ts

## Import Cycles
- None detected.

## Communities (44 total, 1 thin omitted)

### Community 0 - "pdfExport.ts"
Cohesion: 0.05
Nodes (52): expo-file-system, expo-print, expo-sharing, CanvasGridOverview(), CanvasGridOverviewProps, styles, CANVAS_BLOCK_DEFINITIONS, formatCanvasAsMarkdown() (+44 more)

### Community 1 - "Icon"
Cohesion: 0.08
Nodes (57): react-native-svg@15.16.0, react-native-svg, Badge(), Button(), Card(), CreditConfirmationModal(), CreditConfirmationModalProps, formatCreditValue() (+49 more)

### Community 2 - "AuthContext.tsx"
Cohesion: 0.08
Nodes (38): react-native-nitro-google-signin@^2.3.1, react-native-nitro-google-signin, GoogleLogo(), GoogleSignInButton(), GoogleSignInButtonProps, styles, AuthProvider(), AuthContextType (+30 more)

### Community 3 - "SignInScreen.tsx"
Cohesion: 0.09
Nodes (39): @react-navigation/native-stack, EmailVerificationNavigationProp, EmailVerificationRouteProp, EmailVerificationScreen(), styles, ForgotPasswordNavigationProp, ForgotPasswordRouteProp, ForgotPasswordScreen() (+31 more)

### Community 4 - "with"
Cohesion: 0.05
Nodes (46): if, name, needs, permissions, runs-on, steps, concurrency, cancel-in-progress (+38 more)

### Community 5 - "ideasApi.ts"
Cohesion: 0.10
Nodes (36): mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams, TestHarness(), useIdeaDetails(), UseIdeaDetailsResult, mapBackendIdeaToCard() (+28 more)

### Community 6 - "react-native"
Cohesion: 0.16
Nodes (14): react-native, AuthCardProps, styles, CardProps, styles, styles, ScreenContainerProps, styles (+6 more)

### Community 7 - "AppProviders.tsx"
Cohesion: 0.09
Nodes (23): AppErrorBoundary, AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles, BadgeProps, styles, IconBadgeProps (+15 more)

### Community 8 - "ValidateModalScreen.tsx"
Cohesion: 0.08
Nodes (21): { withAndroidManifest }, AppConfig, config, DEFAULT_API_URL, getAppConfig(), getDefaultApiUrl(), isDemoTopUpEnabled(), sanitizeApiUrl() (+13 more)

### Community 9 - "ActivityScreen.tsx"
Cohesion: 0.15
Nodes (21): ActivityCard(), ActivityCardProps, styles, ActivityFilterBar(), ActivityFilterBarProps, styles, ACTIVITY_FILTERS, ActivityFilterOption (+13 more)

### Community 10 - "react"
Cohesion: 0.09
Nodes (20): react, react-test-renderer, mockNavigate, mockRefreshUser, mockUser, mockNavigate, mockRefreshUser, mockUser (+12 more)

### Community 11 - "expo"
Cohesion: 0.07
Nodes (27): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, versionCode (+19 more)

### Community 12 - "components/index.ts"
Cohesion: 0.14
Nodes (17): @react-navigation/native, useAuth(), INVESTOR_TYPES, styles, InvestorMatchScreen(), MatchRouteProp, styles, formatMarketValue() (+9 more)

### Community 13 - "steps"
Cohesion: 0.08
Nodes (26): concurrency, cancel-in-progress, group, EXPO_PUBLIC_API_URL, jobs, validate, name, on (+18 more)

### Community 14 - "apiClient.ts"
Cohesion: 0.18
Nodes (13): RFC-4122, TestHarness(), useValidateIdea(), UseValidateIdeaOptions, AI_GENERATION_TIMEOUT_MS, apiClient, ApiErrorCode, DEFAULT_TIMEOUT_MS (+5 more)

### Community 15 - "PitchDeckScreen.tsx"
Cohesion: 0.20
Nodes (13): PitchDeckControls(), PitchDeckControlsProps, PitchDeckSlideStrip(), PitchDeckSlideStripProps, PitchDeckSlideViewer(), PitchDeckSlideViewerProps, SLIDE_DEFINITIONS, SlideDefinition (+5 more)

### Community 16 - "PickIdeaModal.tsx"
Cohesion: 0.18
Nodes (17): PickIdeaModal(), PickIdeaModalProps, styles, ToolkitHeader(), styles, ToolStartingChoiceModal(), ToolStartingChoiceModalProps, PickIdeaTarget (+9 more)

### Community 17 - "package.json"
Cohesion: 0.12
Nodes (22): devDependencies, jest@~30.5.2, jest-expo@~58.0.15, react-test-renderer@^19.3.0, @testing-library/react-native@^14.1.0, @types/jest@30.0.0, @types/node@^26.6.5, @types/react@~19.3.0 (+14 more)

### Community 18 - "ProfileScreen.test.tsx"
Cohesion: 0.10
Nodes (18): mockNavigate, mockRefreshUser, mockSignOut, mockUpdateName, mockUser, mockGoBack, mockNavigate, mockRefreshUser (+10 more)

### Community 19 - "dependencies"
Cohesion: 0.10
Nodes (20): dependencies, expo-clipboard@~58.0.4, expo-dev-client@~58.0.21, expo-file-system@~58.0.14, expo-font@^58.0.12, expo-print@~58.0.9, expo-secure-store@~58.0.3, expo-sharing@~58.0.23 (+12 more)

### Community 20 - "Icon.tsx"
Cohesion: 0.24
Nodes (6): LUCIDE_NAME_MAP, iconStyles, IconName, IconProps, IconRenderProps, SettingRowProps

### Community 21 - "ApiError"
Cohesion: 0.21
Nodes (10): TestHarness(), TestHarness(), useCanvas(), UseCanvasOptions, TestHarness(), TestHarness(), TestHarness(), usePitchDeck() (+2 more)

### Community 22 - "updates"
Cohesion: 0.12
Nodes (15): prefix, patterns, development-dependencies, day, interval, time, timezone, updates (+7 more)

### Community 23 - "CanvasScreen.tsx"
Cohesion: 0.29
Nodes (8): CanvasBlockSelector(), CanvasBlockSelectorProps, CanvasBlockViewerProps, CanvasEmptyState(), CanvasEmptyStateProps, CanvasBlockDefinition, CanvasScreen(), styles

### Community 24 - "BottomTabNavigator.tsx"
Cohesion: 0.16
Nodes (11): react-native-safe-area-context@~5.11.1, @react-navigation/bottom-tabs@^7.20.0, react-native-safe-area-context, @react-navigation/bottom-tabs, BottomTabNavigator(), CenterValidateButton(), styles, Tab (+3 more)

### Community 25 - "CompetitorScreen.tsx"
Cohesion: 0.29
Nodes (10): CompetitorCard(), CompetitorCardProps, getThreatTone(), SwotMatrixView(), SwotMatrixViewProps, SwotSectionConfig, CompetitorRouteProp, CompetitorScreen() (+2 more)

### Community 26 - "IdeaDetailsScreen.modules.test.tsx"
Cohesion: 0.18
Nodes (12): fullIdeaFixture, ideaWithCanvasFixture, ideaWithoutCanvasFixture, ideaWithoutDeckFixture, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+4 more)

### Community 27 - "OnboardingScreen.tsx"
Cohesion: 0.24
Nodes (10): ChatVisual(), DeckVisual(), StackVisual(), BARS, STACK_CARDS, StackCard, StackCardItem, SlideData (+2 more)

### Community 28 - "CanvasScreen.generation.test.tsx"
Cohesion: 0.20
Nodes (11): expo-clipboard, sampleIdeaWithCanvas, sampleIdeaWithoutCanvas, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams, mockGoBack (+3 more)

### Community 29 - "onboardingScreens.test.tsx"
Cohesion: 0.23
Nodes (7): expo-secure-store, mockNavigate, memoryStore, ONBOARDING_COMPLETED_KEY, onboardingStorage, OnboardingStorageService, _resetOnboardingMemoryStoreForTesting()

### Community 30 - "src_components_index_icon"
Cohesion: 0.25
Nodes (7): HomeHeader(), HomeHeaderProps, HomeQuickActions(), HomeQuickActionsProps, HomeScreen(), NavigationProp, styles

### Community 31 - "react-native-nitro-google-signin.ts"
Cohesion: 0.15
Nodes (4): GoogleOneTapSignIn, GoogleSignInError, NitroGoogleSignin, statusCodes

### Community 32 - "RootNavigator.tsx"
Cohesion: 0.17
Nodes (6): expo-splash-screen@~58.0.14, expo-splash-screen, useOnboarding(), AuthLoadingScreen(), AuthNavigator(), Stack

### Community 33 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+4 more)

### Community 34 - "PitchDeckScreen.test.tsx"
Cohesion: 0.17
Nodes (9): PitchDeckScreen(), mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams, mockGoBack, mockNavigate, mockRefreshUser (+1 more)

### Community 35 - "app/App.tsx"
Cohesion: 0.25
Nodes (8): expo@~58.0.26, expo-status-bar@~58.0.5, expo, expo-status-bar, App(), AppProviders(), RootNavigator(), navigationDarkTheme

### Community 36 - "IdeasScreen.tsx"
Cohesion: 0.27
Nodes (7): IdeasPagination(), IdeasPaginationProps, FilterType, IdeasSearchBar(), IdeasSearchBarProps, NavigationProp, styles

### Community 37 - "RootNavigator.test.tsx"
Cohesion: 0.33
Nodes (7): AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider(), createMockAuthContext(), createMockOnboardingContext(), renderNavigator()

### Community 38 - "generate-brand-icons.py"
Cohesion: 0.39
Nodes (3): create_radial_glow(), generate_icons(), generate_mipmaps()

### Community 39 - "PitchSimulatorScreen.test.tsx"
Cohesion: 0.29
Nodes (6): mockGoBack, mockIdeaWithoutSimulation, mockNavigate, mockRefreshUser, mockRouteParams, mockSimulatedQuestions

### Community 40 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

### Community 41 - "Button.tsx"
Cohesion: 0.33
Nodes (4): ButtonProps, ButtonSize, ButtonVariant, styles

### Community 42 - "CompetitorScreen.test.tsx"
Cohesion: 0.33
Nodes (5): mockGoBack, mockIdeaWithCompetitors, mockNavigate, mockRefreshUser, mockRouteParams

## Knowledge Gaps
- **2 isolated node(s):** `RFC-4122`, `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 354 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `pdfExport.ts`, `Icon`, `AuthContext.tsx`, `SignInScreen.tsx`, `ideasApi.ts`, `AppProviders.tsx`, `ValidateModalScreen.tsx`, `ActivityScreen.tsx`, `react`, `components/index.ts`, `PitchDeckScreen.tsx`, `PickIdeaModal.tsx`, `package.json`, `ProfileScreen.test.tsx`, `dependencies`, `Icon.tsx`, `ApiError`, `CanvasScreen.tsx`, `BottomTabNavigator.tsx`, `CompetitorScreen.tsx`, `IdeaDetailsScreen.modules.test.tsx`, `OnboardingScreen.tsx`, `CanvasScreen.generation.test.tsx`, `onboardingScreens.test.tsx`, `src_components_index_icon`, `PitchDeckScreen.test.tsx`, `IdeasScreen.tsx`, `RootNavigator.test.tsx`, `PitchSimulatorScreen.test.tsx`, `Button.tsx`, `CompetitorScreen.test.tsx`?**
  _High betweenness centrality (0.218) - this node is a cross-community bridge._
- **What connects `RFC-4122`, `expo/tsconfig.base` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `pdfExport.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05268414481897628 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `pdfExport.ts`, `Icon`, `AuthContext.tsx`, `SignInScreen.tsx`, `ideasApi.ts`, `react-native`, `AppProviders.tsx`, `ValidateModalScreen.tsx`, `ActivityScreen.tsx`, `components/index.ts`, `apiClient.ts`, `PitchDeckScreen.tsx`, `PickIdeaModal.tsx`, `package.json`, `ProfileScreen.test.tsx`, `dependencies`, `Icon.tsx`, `ApiError`, `CanvasScreen.tsx`, `BottomTabNavigator.tsx`, `CompetitorScreen.tsx`, `IdeaDetailsScreen.modules.test.tsx`, `OnboardingScreen.tsx`, `CanvasScreen.generation.test.tsx`, `onboardingScreens.test.tsx`, `src_components_index_icon`, `RootNavigator.tsx`, `PitchDeckScreen.test.tsx`, `app/App.tsx`, `IdeasScreen.tsx`, `RootNavigator.test.tsx`, `PitchSimulatorScreen.test.tsx`, `Button.tsx`, `CompetitorScreen.test.tsx`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **Should `Icon` be split into smaller, more focused modules?**
  _Cohesion score 0.08009635651912074 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Should `AuthContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08182349503214495 - nodes in this community are weakly interconnected._