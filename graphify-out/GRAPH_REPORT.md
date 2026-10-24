# Graph Report - PitchMint-mobile  (2026-10-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 371 nodes · 1041 edges · 17 communities (16 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3a368d2b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AuthContext.tsx
- SignInScreen.tsx
- package.json
- HomeScreen.tsx
- onboardingScreens.test.tsx
- OnboardingScreen.tsx
- BottomTabNavigator.tsx
- ProfileScreen.tsx
- expo
- react-native
- react
- theme/index.ts
- devDependencies
- tsconfig.json
- src_theme_index_typography
- Pill.tsx

## God Nodes (most connected - your core abstractions)
1. `react` - 38 edges
2. `react-native` - 38 edges
3. `Colors` - 31 edges
4. `typography` - 26 edges
5. `spacing` - 24 edges
6. `borderRadius` - 19 edges
7. `Icon()` - 18 edges
8. `@react-navigation/native` - 15 edges
9. `useAuth()` - 14 edges
10. `expo` - 13 edges

## Surprising Connections (you probably didn't know these)
- `PillProps` --references--> `Tone`  [EXTRACTED]
  src/components/Pill.tsx → src/theme/colors.ts
- `AuthNavigatorProps` --references--> `AuthStackParamList`  [EXTRACTED]
  src/navigation/AuthNavigator.tsx → src/navigation/types.ts
- `BadgeProps` --references--> `Tone`  [EXTRACTED]
  src/components/Badge.tsx → src/theme/colors.ts
- `InputProps` --references--> `IconName`  [EXTRACTED]
  src/components/Input.tsx → src/components/Icon.tsx
- `EmailVerificationScreen()` --calls--> `useAuth()`  [EXTRACTED]
  src/features/auth/screens/EmailVerificationScreen.tsx → src/context/AuthContext.tsx

## Import Cycles
- None detected.

## Communities (17 total, 1 thin omitted)

### Community 0 - "AuthContext.tsx"
Cohesion: 0.08
Nodes (33): RFC-4122, AppConfig, config, AuthContextType, AuthProvider(), mockUser, apiClient, ApiError (+25 more)

### Community 1 - "SignInScreen.tsx"
Cohesion: 0.11
Nodes (39): @react-navigation/native-stack, AuthCard(), src_components_index_authcard, src_components_index_button, src_components_index_googlesigninbutton, src_components_index_icon, src_components_index_input, Input() (+31 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (40): dependencies, expo, expo-secure-store, expo-status-bar, react, react-native, react-native-safe-area-context, react-native-screens (+32 more)

### Community 3 - "HomeScreen.tsx"
Cohesion: 0.10
Nodes (26): Card(), CardProps, styles, src_components_index_card, src_components_index_iconbadge, src_components_index_pill, src_components_index_scorebar, src_components_index_scorering (+18 more)

### Community 4 - "onboardingScreens.test.tsx"
Cohesion: 0.10
Nodes (20): expo-secure-store, ref_react_test_renderer, AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider(), SignInScreen(), mockClearError (+12 more)

### Community 5 - "OnboardingScreen.tsx"
Cohesion: 0.07
Nodes (19): react-native-safe-area-context, AppErrorBoundary, AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles, Button(), ButtonProps (+11 more)

### Community 6 - "BottomTabNavigator.tsx"
Cohesion: 0.09
Nodes (21): GoogleSignInButton(), GoogleSignInButtonProps, styles, useAuth(), useOnboarding(), ActivityScreen(), AuthLoadingScreen(), HomeScreen() (+13 more)

### Community 7 - "ProfileScreen.tsx"
Cohesion: 0.16
Nodes (16): BadgeProps, styles, IconName, IconBadge(), IconBadgeProps, styles, src_components_index_iconname, InputProps (+8 more)

### Community 8 - "expo"
Cohesion: 0.09
Nodes (21): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+13 more)

### Community 9 - "react-native"
Cohesion: 0.19
Nodes (10): react-native, AuthCardProps, styles, ScreenContainer(), ScreenContainerProps, styles, SectionHeader(), SectionHeaderProps (+2 more)

### Community 10 - "react"
Cohesion: 0.27
Nodes (8): react, Icon(), IconProps, styles, styles, styles, WelcomeNavigationProp, src_theme_index_colors

### Community 11 - "theme/index.ts"
Cohesion: 0.35
Nodes (7): styles, Theme, borderRadius, shadows, spacing, touchTargets, typography

### Community 12 - "devDependencies"
Cohesion: 0.22
Nodes (9): devDependencies, jest, jest-expo, @testing-library/react-native, @types/jest, @types/node, @types/react, @types/react-test-renderer (+1 more)

### Community 13 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

### Community 14 - "src_theme_index_typography"
Cohesion: 0.40
Nodes (5): getScoreColor(), ScoreRing(), ScoreRingProps, styles, src_theme_index_typography

### Community 15 - "Pill.tsx"
Cohesion: 0.50
Nodes (3): Pill(), PillProps, styles

## Knowledge Gaps
- **152 isolated node(s):** `AppConfig`, `RequestOptions`, `UnauthorizedHandler`, `ForgotPasswordParams`, `GoogleAuthParams` (+147 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 181 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `AuthContext.tsx`, `SignInScreen.tsx`, `package.json`, `HomeScreen.tsx`, `onboardingScreens.test.tsx`, `OnboardingScreen.tsx`, `BottomTabNavigator.tsx`, `ProfileScreen.tsx`, `react`, `theme/index.ts`, `src_theme_index_typography`, `Pill.tsx`?**
  _High betweenness centrality (0.188) - this node is a cross-community bridge._
- **Why does `react` connect `react` to `AuthContext.tsx`, `SignInScreen.tsx`, `package.json`, `HomeScreen.tsx`, `onboardingScreens.test.tsx`, `OnboardingScreen.tsx`, `BottomTabNavigator.tsx`, `ProfileScreen.tsx`, `react-native`, `theme/index.ts`, `src_theme_index_typography`, `Pill.tsx`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **What connects `AppConfig`, `RequestOptions`, `UnauthorizedHandler` to the rest of the system?**
  _152 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AuthContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07686274509803921 - nodes in this community are weakly interconnected._
- **Should `SignInScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10638297872340426 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.049682875264270614 - nodes in this community are weakly interconnected._
- **Should `HomeScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1032258064516129 - nodes in this community are weakly interconnected._