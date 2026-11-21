# Graph Report - PitchMint-mobile  (2026-11-21)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 926 nodes · 3071 edges · 32 communities (30 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `377cec54`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react-native
- Icon
- PitchDeckScreen.tsx
- react
- AuthContext.tsx
- with
- HomeScreen.tsx
- ValidateModalScreen.tsx
- apiClient.ts
- ideasApi.ts
- expo
- steps
- useAuth
- package.json
- SignInScreen.tsx
- BottomTabNavigator.tsx
- onboardingScreens.test.tsx
- RootNavigator.tsx
- updates
- CanvasScreen.generation.test.tsx
- ProfileScreen.tsx
- IdeaDetailsScreen.modules.test.tsx
- dependencies
- scripts
- usePitchDeck.ts
- useCanvas.ts
- app/App.tsx
- useIdeaDetails.recovery.test.tsx
- tsconfig.json
- AppErrorBoundary
- PitchDeckScreen.test.tsx

## God Nodes (most connected - your core abstractions)
1. `react-native` - 136 edges
2. `react` - 119 edges
3. `Icon()` - 65 edges
4. `Card()` - 46 edges
5. `react-test-renderer` - 43 edges
6. `Button()` - 39 edges
7. `IconBadge()` - 39 edges
8. `ideasApi` - 33 edges
9. `useAuth()` - 31 edges
10. `ApiError` - 30 edges

## Surprising Connections (you probably didn't know these)
- `HomeScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/home/screens/HomeScreen.tsx → src/services/api/ideasApi.ts
- `IdeasScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/ideas/screens/IdeasScreen.tsx → src/services/api/ideasApi.ts
- `BadgeProps` --references--> `Tone`  [EXTRACTED]
  src/components/Badge.tsx → src/theme/colors.ts
- `PillProps` --references--> `Tone`  [EXTRACTED]
  src/components/Pill.tsx → src/theme/colors.ts
- `CanvasBlockSelectorProps` --references--> `CanvasBlockDefinition`  [EXTRACTED]
  src/features/canvas/components/CanvasBlockSelector.tsx → src/features/canvas/constants/blockDefinitions.ts

## Import Cycles
- None detected.

## Communities (32 total, 2 thin omitted)

### Community 0 - "react-native"
Cohesion: 0.06
Nodes (64): react-native, react-native-safe-area-context, AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles, AuthCardProps, styles (+56 more)

### Community 1 - "Icon"
Cohesion: 0.09
Nodes (58): Badge(), Button(), Card(), CreditConfirmationModal(), DeleteConfirmationModal(), Icon(), IconBadge(), IdeaCard() (+50 more)

### Community 2 - "PitchDeckScreen.tsx"
Cohesion: 0.06
Nodes (49): expo-file-system@~58.0.14, expo-print@~58.0.9, expo-sharing@~58.0.23, expo-file-system, expo-print, expo-sharing, PitchDeckControls(), PitchDeckControlsProps (+41 more)

### Community 3 - "react"
Cohesion: 0.06
Nodes (41): react, react-test-renderer, iconStyles, IconName, IconProps, IconRenderProps, ActivityCard(), ActivityCardProps (+33 more)

### Community 4 - "AuthContext.tsx"
Cohesion: 0.07
Nodes (38): GoogleLogo(), GoogleSignInButtonProps, styles, AuthContextType, AuthProvider(), logAuthWarning(), createAuthTestRenderer(), createDeferred() (+30 more)

### Community 5 - "with"
Cohesion: 0.05
Nodes (46): if, name, needs, permissions, runs-on, steps, concurrency, cancel-in-progress (+38 more)

### Community 6 - "HomeScreen.tsx"
Cohesion: 0.09
Nodes (25): IdeaCardProps, HomeHeader(), HomeHeaderProps, HomeQuickActions(), HomeQuickActionsProps, HomeScreen(), NavigationProp, styles (+17 more)

### Community 7 - "ValidateModalScreen.tsx"
Cohesion: 0.10
Nodes (21): { withAndroidManifest }, AppConfig, DEFAULT_API_URL, getAppConfig(), getDefaultApiUrl(), isDemoTopUpEnabled(), sanitizeApiUrl(), ValidateAnalyzingStage() (+13 more)

### Community 8 - "apiClient.ts"
Cohesion: 0.12
Nodes (21): RFC-4122, mockGoBack, mockNavigate, mockRefreshUser, mockGoBack, mockNavigate, mockRefreshUser, AI_GENERATION_TIMEOUT_MS (+13 more)

### Community 9 - "ideasApi.ts"
Cohesion: 0.14
Nodes (24): CompetitorActionModuleProps, IdeaActionModulesProps, PitchSimulationActionModuleProps, UseIdeaDetailsResult, mapBackendIdeaToCard(), BackendIdea, CanvasContentData, CanvasResponse (+16 more)

### Community 10 - "expo"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, projectId (+18 more)

### Community 11 - "steps"
Cohesion: 0.08
Nodes (26): concurrency, cancel-in-progress, group, EXPO_PUBLIC_API_URL, jobs, validate, name, on (+18 more)

### Community 12 - "useAuth"
Cohesion: 0.18
Nodes (21): @react-navigation/native-stack, AuthCard(), GoogleSignInButton(), Input(), useAuth(), ForgotPasswordNavigationProp, ForgotPasswordRouteProp, ForgotPasswordScreen() (+13 more)

### Community 13 - "package.json"
Cohesion: 0.12
Nodes (22): devDependencies, jest@~30.5.2, jest-expo@~58.0.15, react-test-renderer@^19.3.0, @testing-library/react-native@^14.1.0, @types/jest@30.0.0, @types/node@^26.6.5, @types/react@~19.3.0 (+14 more)

### Community 14 - "SignInScreen.tsx"
Cohesion: 0.15
Nodes (14): useOnboarding(), EmailVerificationNavigationProp, EmailVerificationRouteProp, EmailVerificationScreen(), styles, SignInNavigationProp, SignInRouteProp, SignInScreen() (+6 more)

### Community 15 - "BottomTabNavigator.tsx"
Cohesion: 0.17
Nodes (13): @react-navigation/bottom-tabs@^7.20.0, @react-navigation/bottom-tabs, @react-navigation/native, BottomTabNavigator(), CenterValidateButton(), styles, Tab, TabIconWithDotProps (+5 more)

### Community 16 - "onboardingScreens.test.tsx"
Cohesion: 0.18
Nodes (9): expo-secure-store, OnboardingScreen(), WelcomeScreen(), mockNavigate, memoryStore, ONBOARDING_COMPLETED_KEY, onboardingStorage, OnboardingStorageService (+1 more)

### Community 17 - "RootNavigator.tsx"
Cohesion: 0.17
Nodes (10): AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider(), AuthLoadingScreen(), RootNavigator(), Stack, createMockAuthContext() (+2 more)

### Community 18 - "updates"
Cohesion: 0.12
Nodes (15): prefix, patterns, development-dependencies, day, interval, time, timezone, updates (+7 more)

### Community 19 - "CanvasScreen.generation.test.tsx"
Cohesion: 0.18
Nodes (12): expo-clipboard@~58.0.4, expo-clipboard, sampleIdeaWithCanvas, sampleIdeaWithoutCanvas, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+4 more)

### Community 20 - "ProfileScreen.tsx"
Cohesion: 0.22
Nodes (11): config, ProfileHeader(), SettingRow(), DEMO_PLANS, LEGAL_URLS, ProfileScreen(), mockRefreshUser, mockSignOut (+3 more)

### Community 21 - "IdeaDetailsScreen.modules.test.tsx"
Cohesion: 0.18
Nodes (12): fullIdeaFixture, ideaWithCanvasFixture, ideaWithoutCanvasFixture, ideaWithoutDeckFixture, mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams (+4 more)

### Community 22 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, expo-font@^58.0.12, expo-secure-store@~58.0.3, react@19.3.0, react-native@0.88.1, react-native-safe-area-context@~5.11.1, react-native-screens@~4.30.1, @react-native-vector-icons/lucide@^14.0.0 (+5 more)

### Community 23 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+4 more)

### Community 24 - "usePitchDeck.ts"
Cohesion: 0.32
Nodes (5): TestHarness(), TestHarness(), TestHarness(), usePitchDeck(), UsePitchDeckOptions

### Community 25 - "useCanvas.ts"
Cohesion: 0.31
Nodes (5): TestHarness(), TestHarness(), useCanvas(), UseCanvasOptions, formatCanvasAsMarkdown()

### Community 26 - "app/App.tsx"
Cohesion: 0.24
Nodes (7): expo@~58.0.26, expo-status-bar@~58.0.5, expo, expo-status-bar, App(), AppProviders(), navigationDarkTheme

### Community 27 - "useIdeaDetails.recovery.test.tsx"
Cohesion: 0.33
Nodes (6): mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams, TestHarness(), useIdeaDetails()

### Community 28 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

### Community 30 - "PitchDeckScreen.test.tsx"
Cohesion: 0.33
Nodes (4): mockGoBack, mockNavigate, mockRefreshUser, mockRouteParams

## Knowledge Gaps
- **2 isolated node(s):** `expo/tsconfig.base`, `RFC-4122`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 317 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `Icon`, `PitchDeckScreen.tsx`, `react`, `AuthContext.tsx`, `HomeScreen.tsx`, `ValidateModalScreen.tsx`, `apiClient.ts`, `ideasApi.ts`, `useAuth`, `package.json`, `SignInScreen.tsx`, `BottomTabNavigator.tsx`, `onboardingScreens.test.tsx`, `RootNavigator.tsx`, `CanvasScreen.generation.test.tsx`, `ProfileScreen.tsx`, `IdeaDetailsScreen.modules.test.tsx`, `dependencies`, `usePitchDeck.ts`, `useCanvas.ts`, `useIdeaDetails.recovery.test.tsx`, `PitchDeckScreen.test.tsx`?**
  _High betweenness centrality (0.228) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base`, `RFC-4122` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `react-native` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `react-native`, `Icon`, `PitchDeckScreen.tsx`, `AuthContext.tsx`, `HomeScreen.tsx`, `ValidateModalScreen.tsx`, `apiClient.ts`, `ideasApi.ts`, `useAuth`, `package.json`, `SignInScreen.tsx`, `BottomTabNavigator.tsx`, `onboardingScreens.test.tsx`, `RootNavigator.tsx`, `CanvasScreen.generation.test.tsx`, `ProfileScreen.tsx`, `IdeaDetailsScreen.modules.test.tsx`, `dependencies`, `usePitchDeck.ts`, `useCanvas.ts`, `app/App.tsx`, `useIdeaDetails.recovery.test.tsx`, `PitchDeckScreen.test.tsx`?**
  _High betweenness centrality (0.139) - this node is a cross-community bridge._
- **Should `Icon` be split into smaller, more focused modules?**
  _Cohesion score 0.08888888888888889 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Should `PitchDeckScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.05527805527805528 - nodes in this community are weakly interconnected._