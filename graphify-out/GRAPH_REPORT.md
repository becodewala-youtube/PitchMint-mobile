# Graph Report - PitchMint-mobile  (2026-11-14)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 580 nodes · 1505 edges · 23 communities (21 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4a70afa4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- IdeaDetailsScreen.tsx
- react-native
- apiClient.ts
- with
- expo
- steps
- onboardingScreens.test.tsx
- package.json
- BottomTabNavigator.tsx
- ResetPasswordScreen.tsx
- EmailVerificationScreen.tsx
- updates
- env.ts
- ActivityScreen.tsx
- OnboardingScreen.tsx
- dependencies
- SignInScreen.tsx
- scripts
- GoogleSignInButton.tsx
- tsconfig.json
- AppErrorBoundary
- App.tsx

## God Nodes (most connected - your core abstractions)
1. `react-native` - 52 edges
2. `react` - 49 edges
3. `useAuth()` - 24 edges
4. `ApiError` - 23 edges
5. `Icon()` - 20 edges
6. `@react-navigation/native` - 19 edges
7. `ideasApi` - 16 edges
8. `expo` - 15 edges
9. `react-test-renderer` - 14 edges
10. `TokenStorageError` - 13 edges

## Surprising Connections (you probably didn't know these)
- `BadgeProps` --references--> `Tone`  [EXTRACTED]
  src/components/Badge.tsx → src/theme/colors.ts
- `InputProps` --references--> `IconName`  [EXTRACTED]
  src/components/Input.tsx → src/components/Icon.tsx
- `PillProps` --references--> `Tone`  [EXTRACTED]
  src/components/Pill.tsx → src/theme/colors.ts
- `AuthNavigatorProps` --references--> `AuthStackParamList`  [EXTRACTED]
  src/navigation/AuthNavigator.tsx → src/navigation/types.ts
- `GoogleSignInButton()` --calls--> `useAuth()`  [EXTRACTED]
  src/components/GoogleSignInButton.tsx → src/context/AuthContext.tsx

## Import Cycles
- None detected.

## Communities (23 total, 2 thin omitted)

### Community 0 - "IdeaDetailsScreen.tsx"
Cohesion: 0.05
Nodes (67): expo-clipboard, @react-navigation/native, react-test-renderer, useAuth(), CANVAS_BLOCK_DEFINITIONS, CanvasBlockDefinition, CanvasScreen(), formatCanvasAsMarkdown() (+59 more)

### Community 1 - "react-native"
Cohesion: 0.07
Nodes (49): react, react-native, react-native-safe-area-context, AppProviders(), AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles (+41 more)

### Community 2 - "apiClient.ts"
Cohesion: 0.06
Nodes (46): RFC-4122, AuthContextType, AuthProvider(), logAuthWarning(), mockUser, DEMO_PLANS, ProfileScreen(), SettingRow() (+38 more)

### Community 3 - "with"
Cohesion: 0.05
Nodes (46): if, name, needs, permissions, runs-on, steps, concurrency, cancel-in-progress (+38 more)

### Community 4 - "expo"
Cohesion: 0.07
Nodes (26): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, package, predictiveBackGestureEnabled, projectId (+18 more)

### Community 5 - "steps"
Cohesion: 0.08
Nodes (26): concurrency, cancel-in-progress, group, EXPO_PUBLIC_API_URL, jobs, validate, name, on (+18 more)

### Community 6 - "onboardingScreens.test.tsx"
Cohesion: 0.14
Nodes (15): expo-secure-store, AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider(), mockNavigate, RootNavigator(), createMockAuthContext() (+7 more)

### Community 7 - "package.json"
Cohesion: 0.12
Nodes (22): devDependencies, jest@~30.5.2, jest-expo@~58.0.14, react-test-renderer@^19.3.0, @testing-library/react-native@^14.1.0, @types/jest@30.0.0, @types/node@^26.6.5, @types/react@~19.3.0 (+14 more)

### Community 8 - "BottomTabNavigator.tsx"
Cohesion: 0.12
Nodes (10): @react-navigation/bottom-tabs, AuthLoadingScreen(), BottomTabNavigator(), styles, Tab, TabIconWithDotProps, Stack, AuthStackNavigationProp (+2 more)

### Community 9 - "ResetPasswordScreen.tsx"
Cohesion: 0.25
Nodes (16): AuthCard(), Button(), Input(), ForgotPasswordScreen(), ResetPasswordNavigationProp, ResetPasswordRouteProp, ResetPasswordScreen(), styles (+8 more)

### Community 10 - "EmailVerificationScreen.tsx"
Cohesion: 0.18
Nodes (14): @react-navigation/native-stack, useOnboarding(), EmailVerificationNavigationProp, EmailVerificationRouteProp, EmailVerificationScreen(), styles, ForgotPasswordNavigationProp, ForgotPasswordRouteProp (+6 more)

### Community 11 - "updates"
Cohesion: 0.12
Nodes (15): prefix, patterns, development-dependencies, day, interval, time, timezone, updates (+7 more)

### Community 12 - "env.ts"
Cohesion: 0.17
Nodes (8): { withAndroidManifest }, AppConfig, config, DEFAULT_API_URL, getAppConfig(), getDefaultApiUrl(), isDemoTopUpEnabled(), sanitizeApiUrl()

### Community 13 - "ActivityScreen.tsx"
Cohesion: 0.27
Nodes (11): Card(), IconBadge(), Pill(), ScreenContainer(), ActivityScreen(), getServiceVisuals(), styles, activityApi (+3 more)

### Community 14 - "OnboardingScreen.tsx"
Cohesion: 0.18
Nodes (13): Icon(), BARS, ChatVisual(), DeckVisual(), OnboardingScreen(), SlideData, SLIDES, STACK_CARDS (+5 more)

### Community 15 - "dependencies"
Cohesion: 0.15
Nodes (13): dependencies, expo-clipboard@~58.0.4, expo-secure-store@~58.0.3, expo-status-bar@~58.0.5, react@19.3.0, react-native@0.88.1, react-native-safe-area-context@~5.11.1, react-native-screens@~4.30.1 (+5 more)

### Community 16 - "SignInScreen.tsx"
Cohesion: 0.17
Nodes (8): SignInNavigationProp, SignInRouteProp, SignInScreen(), styles, mockClearError, mockNavigate, mockRouteParams, mockSignIn

### Community 17 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+4 more)

### Community 18 - "GoogleSignInButton.tsx"
Cohesion: 0.23
Nodes (9): GoogleLogo(), GoogleSignInButton(), GoogleSignInButtonProps, styles, AuthSuccessResponse, checkGoogleSignInStatus(), googleAuthService, GoogleSignInConfig (+1 more)

### Community 19 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

### Community 21 - "App.tsx"
Cohesion: 0.50
Nodes (3): expo@~58.0.25, expo, App()

## Knowledge Gaps
- **2 isolated node(s):** `expo/tsconfig.base`, `RFC-4122`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 254 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `IdeaDetailsScreen.tsx`, `apiClient.ts`, `onboardingScreens.test.tsx`, `package.json`, `BottomTabNavigator.tsx`, `ResetPasswordScreen.tsx`, `EmailVerificationScreen.tsx`, `env.ts`, `ActivityScreen.tsx`, `OnboardingScreen.tsx`, `dependencies`, `SignInScreen.tsx`, `GoogleSignInButton.tsx`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **What connects `expo/tsconfig.base`, `RFC-4122` to the rest of the system?**
  _2 weakly-connected nodes found - possible missing edges._
- **Should `IdeaDetailsScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.054982817869415807 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react-native` to `IdeaDetailsScreen.tsx`, `apiClient.ts`, `onboardingScreens.test.tsx`, `package.json`, `BottomTabNavigator.tsx`, `ResetPasswordScreen.tsx`, `EmailVerificationScreen.tsx`, `ActivityScreen.tsx`, `OnboardingScreen.tsx`, `dependencies`, `SignInScreen.tsx`, `GoogleSignInButton.tsx`?**
  _High betweenness centrality (0.092) - this node is a cross-community bridge._
- **Should `react-native` be split into smaller, more focused modules?**
  _Cohesion score 0.07259407259407259 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Should `apiClient.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06277436347673397 - nodes in this community are weakly interconnected._