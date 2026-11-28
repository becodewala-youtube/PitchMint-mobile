# Graph Report - PitchMint-mobile  (2026-11-28)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1098 nodes · 3581 edges · 42 communities (37 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ed296bd6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react-native
- components/index.ts
- react
- AuthContext.tsx
- pdfExport.ts
- CanvasScreen.tsx
- react-test-renderer
- with
- useAuth
- ideasApi.types.ts
- PitchDeckScreen.tsx
- ideasApi.ts
- expo
- steps
- package.json
- ProfileScreen.test.tsx
- dependencies
- RootNavigator.test.tsx
- apiClient.ts
- env.ts
- onboardingScreens.test.tsx
- updates
- CanvasScreen.generation.test.tsx
- icons/types.ts
- IdeaDetailsScreen.modules.test.tsx
- OnboardingScreen.tsx
- useValidateIdea.ts
- react-native-nitro-google-signin.ts
- scripts
- security-check.mjs
- navigation/types.ts
- RootNavigator.tsx
- generate-brand-icons.py
- usePitchDeck.recovery.test.tsx
- tsconfig.json
- safeLinking.ts
- react-native-nitro-google-signin
- expo-dev-client@~58.0.22
- expo-splash-screen
- expo-status-bar
- react-native-screens@~4.30.1

## God Nodes (most connected - your core abstractions)
1. `react-native` - 161 edges
2. `react` - 135 edges
3. `react-test-renderer` - 52 edges
4. `Icon()` - 42 edges
5. `ideasApi` - 40 edges
6. `useAuth()` - 36 edges
7. `ApiError` - 35 edges
8. `logDevWarning()` - 35 edges
9. `Card()` - 31 edges
10. `@react-navigation/native` - 29 edges

## Surprising Connections (you probably didn't know these)
- `Input()` --calls--> `Icon()`  [EXTRACTED]
  src/components/Input.tsx → src/components/Icon.tsx
- `ScreenContainer()` --calls--> `useAppSafeArea()`  [EXTRACTED]
  src/components/ScreenContainer.tsx → src/utils/safeArea.ts
- `HomeScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/home/screens/HomeScreen.tsx → src/services/api/ideasApi.ts
- `IdeasScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/ideas/screens/IdeasScreen.tsx → src/services/api/ideasApi.ts
- `PickIdeaModal()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/toolkit/components/PickIdeaModal.tsx → src/services/api/ideasApi.ts

## Import Cycles
- None detected.

## Communities (42 total, 5 thin omitted)

### Community 0 - "react-native"
Cohesion: 0.06
Nodes (54): react-native, AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles, AuthCardProps, styles, BadgeProps (+46 more)

### Community 1 - "components/index.ts"
Cohesion: 0.07
Nodes (59): Badge(), Button(), Card(), Icon(), IconBadge(), IdeaCard(), Pill(), ScoreBar() (+51 more)

### Community 2 - "react"
Cohesion: 0.05
Nodes (49): react, HomeHeader(), HomeQuickActions(), HomeQuickActionsProps, HomeScreen(), NavigationProp, styles, mockNavigate (+41 more)

### Community 3 - "AuthContext.tsx"
Cohesion: 0.08
Nodes (40): GoogleLogo(), GoogleSignInButton(), GoogleSignInButtonProps, styles, AuthProvider(), AuthContextType, logAuthWarning(), createAuthTestRenderer() (+32 more)

### Community 4 - "pdfExport.ts"
Cohesion: 0.09
Nodes (37): expo-file-system, expo-print, expo-sharing, ExportCanvasDownloadInfo, ExportCanvasOptions, exportCanvasPdf(), ExportCanvasResult, generateCanvasDownloadFilename() (+29 more)

### Community 5 - "CanvasScreen.tsx"
Cohesion: 0.09
Nodes (28): CanvasBlockSelector(), CanvasBlockSelectorProps, CanvasBlockViewerProps, CanvasEmptyState(), CanvasEmptyStateProps, CanvasGridOverview(), CanvasGridOverviewProps, styles (+20 more)

### Community 6 - "react-test-renderer"
Cohesion: 0.09
Nodes (33): react-test-renderer, ActivityCard(), ActivityCardProps, styles, ActivityFilterBar(), ActivityFilterBarProps, styles, ACTIVITY_FILTERS (+25 more)

### Community 7 - "with"
Cohesion: 0.05
Nodes (46): if, name, needs, permissions, runs-on, steps, concurrency, cancel-in-progress (+38 more)

### Community 8 - "useAuth"
Cohesion: 0.12
Nodes (31): useAuth(), EmailVerificationNavigationProp, EmailVerificationRouteProp, EmailVerificationScreen(), styles, ForgotPasswordNavigationProp, ForgotPasswordRouteProp, ForgotPasswordScreen() (+23 more)

### Community 9 - "ideasApi.types.ts"
Cohesion: 0.08
Nodes (35): INVESTOR_TYPES, InvestorDirectoryScreen(), styles, InvestorMatchScreen(), MatchRouteProp, styles, mockGoBack, mockNavigate (+27 more)

### Community 10 - "PitchDeckScreen.tsx"
Cohesion: 0.10
Nodes (23): PitchDeckControls(), PitchDeckControlsProps, PitchDeckSlideStrip(), PitchDeckSlideStripProps, PitchDeckSlideViewer(), PitchDeckSlideViewerProps, SLIDE_DEFINITIONS, SlideDefinition (+15 more)

### Community 11 - "ideasApi.ts"
Cohesion: 0.14
Nodes (22): IdeaCardProps, CompetitorActionModuleProps, IdeaActionModulesProps, PitchSimulationActionModuleProps, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+14 more)

### Community 12 - "expo"
Cohesion: 0.07
Nodes (27): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, versionCode (+19 more)

### Community 13 - "steps"
Cohesion: 0.08
Nodes (26): concurrency, cancel-in-progress, group, EXPO_PUBLIC_API_URL, jobs, validate, name, on (+18 more)

### Community 14 - "package.json"
Cohesion: 0.12
Nodes (22): devDependencies, jest@~30.5.2, jest-expo@~58.0.16, react-test-renderer@^19.3.0, @testing-library/react-native@^14.1.0, @types/jest@30.0.0, @types/node@^26.6.5, @types/react@~19.3.0 (+14 more)

### Community 15 - "ProfileScreen.test.tsx"
Cohesion: 0.10
Nodes (18): mockNavigate, mockRefreshUser, mockSignOut, mockUpdateName, mockUser, mockGoBack, mockNavigate, mockRefreshUser (+10 more)

### Community 16 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, expo@~58.1.0, expo-file-system@~58.0.15, expo-print@~58.0.9, expo-secure-store@~58.0.3, expo-sharing@~58.0.24, react@19.3.0, react-native@0.88.1 (+13 more)

### Community 17 - "RootNavigator.test.tsx"
Cohesion: 0.14
Nodes (11): App(), AppErrorBoundary, AppProviders(), AuthContext, OnboardingContext, OnboardingContextType, RootNavigator(), createMockAuthContext() (+3 more)

### Community 18 - "apiClient.ts"
Cohesion: 0.22
Nodes (10): RFC-4122, AI_GENERATION_TIMEOUT_MS, apiClient, ApiErrorCode, DEFAULT_TIMEOUT_MS, generateIdempotencyKey(), generateRequestId(), setUnauthorizedHandler() (+2 more)

### Community 19 - "env.ts"
Cohesion: 0.13
Nodes (9): { AndroidConfig }, RELEASE_BLOCKED_PERMISSIONS, { withAndroidManifest }, AppConfig, DEFAULT_API_URL, getAppConfig(), getDefaultApiUrl(), isDemoTopUpEnabled() (+1 more)

### Community 20 - "onboardingScreens.test.tsx"
Cohesion: 0.20
Nodes (10): expo-secure-store, OnboardingProvider(), useOnboarding(), OnboardingScreen(), mockNavigate, memoryStore, ONBOARDING_COMPLETED_KEY, onboardingStorage (+2 more)

### Community 21 - "updates"
Cohesion: 0.12
Nodes (15): prefix, patterns, development-dependencies, day, interval, time, timezone, updates (+7 more)

### Community 22 - "CanvasScreen.generation.test.tsx"
Cohesion: 0.17
Nodes (12): expo-clipboard@~58.0.4, expo-clipboard, sampleIdeaWithCanvas, sampleIdeaWithoutCanvas, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+4 more)

### Community 23 - "icons/types.ts"
Cohesion: 0.26
Nodes (5): iconStyles, IconName, IconProps, IconRenderProps, SettingRowProps

### Community 24 - "IdeaDetailsScreen.modules.test.tsx"
Cohesion: 0.18
Nodes (12): fullIdeaFixture, ideaWithCanvasFixture, ideaWithoutCanvasFixture, ideaWithoutDeckFixture, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+4 more)

### Community 25 - "OnboardingScreen.tsx"
Cohesion: 0.23
Nodes (10): ChatVisual(), DeckVisual(), StackVisual(), BARS, STACK_CARDS, StackCard, StackCardItem, SlideData (+2 more)

### Community 26 - "useValidateIdea.ts"
Cohesion: 0.23
Nodes (11): ValidateResultsStageProps, ANALYZING_STEPS, MAX_IDEA_LENGTH, MIN_IDEA_LENGTH, ModalStage, TIPS, ValidateTip, TestHarness() (+3 more)

### Community 27 - "react-native-nitro-google-signin.ts"
Cohesion: 0.15
Nodes (4): GoogleOneTapSignIn, GoogleSignInError, NitroGoogleSignin, statusCodes

### Community 28 - "scripts"
Cohesion: 0.15
Nodes (13): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+5 more)

### Community 29 - "security-check.mjs"
Cohesion: 0.19
Nodes (9): BINARY_EXTENSIONS, checkEasReleaseProfiles(), checkTrackedFilesAndSecrets(), FORBIDDEN_EXTENSIONS, FORBIDDEN_TRACKED_FILES, getTrackedFiles(), main(), ROOT (+1 more)

### Community 30 - "navigation/types.ts"
Cohesion: 0.27
Nodes (7): @react-navigation/native, @react-navigation/native-stack, styles, WelcomeNavigationProp, WelcomeScreen(), AuthStackNavigationProp, MainTabNavigationProp

### Community 31 - "RootNavigator.tsx"
Cohesion: 0.20
Nodes (3): AuthLoadingScreen(), AuthNavigator(), Stack

### Community 32 - "generate-brand-icons.py"
Cohesion: 0.39
Nodes (3): create_radial_glow(), generate_icons(), generate_mipmaps()

### Community 33 - "usePitchDeck.recovery.test.tsx"
Cohesion: 0.43
Nodes (5): TestHarness(), TestHarness(), TestHarness(), usePitchDeck(), UsePitchDeckOptions

### Community 34 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

### Community 35 - "safeLinking.ts"
Cohesion: 0.70
Nodes (3): openSafeExternalUrl(), validateExternalUrl(), ValidateExternalUrlOptions

### Community 36 - "react-native-nitro-google-signin"
Cohesion: 0.33
Nodes (4): expo-font@^58.0.12, react-native-nitro-google-signin@^2.3.1, expo-font, react-native-nitro-google-signin

## Knowledge Gaps
- **2 isolated node(s):** `RFC-4122`, `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 368 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `components/index.ts`, `react`, `AuthContext.tsx`, `pdfExport.ts`, `CanvasScreen.tsx`, `react-test-renderer`, `useAuth`, `ideasApi.types.ts`, `PitchDeckScreen.tsx`, `ideasApi.ts`, `package.json`, `ProfileScreen.test.tsx`, `dependencies`, `RootNavigator.test.tsx`, `env.ts`, `onboardingScreens.test.tsx`, `CanvasScreen.generation.test.tsx`, `icons/types.ts`, `IdeaDetailsScreen.modules.test.tsx`, `OnboardingScreen.tsx`, `navigation/types.ts`, `usePitchDeck.recovery.test.tsx`, `safeLinking.ts`?**
  _High betweenness centrality (0.206) - this node is a cross-community bridge._
- **What connects `RFC-4122`, `expo/tsconfig.base` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `react-native` be split into smaller, more focused modules?**
  _Cohesion score 0.059536171685704395 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `react-native`, `components/index.ts`, `AuthContext.tsx`, `CanvasScreen.tsx`, `react-test-renderer`, `useAuth`, `ideasApi.types.ts`, `PitchDeckScreen.tsx`, `ideasApi.ts`, `package.json`, `ProfileScreen.test.tsx`, `dependencies`, `RootNavigator.test.tsx`, `onboardingScreens.test.tsx`, `CanvasScreen.generation.test.tsx`, `icons/types.ts`, `IdeaDetailsScreen.modules.test.tsx`, `OnboardingScreen.tsx`, `useValidateIdea.ts`, `navigation/types.ts`, `RootNavigator.tsx`, `usePitchDeck.recovery.test.tsx`?**
  _High betweenness centrality (0.141) - this node is a cross-community bridge._
- **Should `components/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07047175305765871 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.05194805194805195 - nodes in this community are weakly interconnected._