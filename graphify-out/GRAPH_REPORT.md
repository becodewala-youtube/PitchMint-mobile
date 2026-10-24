# Graph Report - PitchMint-mobile  (2026-10-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 409 nodes · 1121 edges · 12 communities (10 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4fe2a35d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- theme/index.ts
- HomeScreen.tsx
- SignInScreen.tsx
- AuthContext.tsx
- package.json
- RootNavigator.tsx
- expo
- BottomTabNavigator.tsx
- scripts
- tsconfig.json
- AppErrorBoundary

## God Nodes (most connected - your core abstractions)
1. `react-native` - 42 edges
2. `react` - 41 edges
3. `Colors` - 25 edges
4. `typography` - 22 edges
5. `spacing` - 19 edges
6. `useAuth()` - 16 edges
7. `borderRadius` - 15 edges
8. `@react-navigation/native` - 15 edges
9. `Icon()` - 14 edges
10. `expo` - 13 edges

## Surprising Connections (you probably didn't know these)
- `BadgeProps` --references--> `Tone`  [EXTRACTED]
  src/components/Badge.tsx → src/theme/colors.ts
- `InputProps` --references--> `IconName`  [EXTRACTED]
  src/components/Input.tsx → src/components/Icon.tsx
- `PillProps` --references--> `Tone`  [EXTRACTED]
  src/components/Pill.tsx → src/theme/colors.ts
- `AuthNavigatorProps` --references--> `AuthStackParamList`  [EXTRACTED]
  src/navigation/AuthNavigator.tsx → src/navigation/types.ts
- `HomeScreen()` --calls--> `useAuth()`  [EXTRACTED]
  src/features/home/screens/HomeScreen.tsx → src/context/AuthContext.tsx

## Import Cycles
- None detected.

## Communities (12 total, 2 thin omitted)

### Community 0 - "theme/index.ts"
Cohesion: 0.06
Nodes (72): react, react-native, react-native-safe-area-context, AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles, AuthCardProps (+64 more)

### Community 1 - "HomeScreen.tsx"
Cohesion: 0.07
Nodes (45): ref_react_test_renderer, src_components_index_card, src_components_index_icon, src_components_index_iconbadge, src_components_index_iconname, src_components_index_pill, src_components_index_scorering, src_components_index_screencontainer (+37 more)

### Community 2 - "SignInScreen.tsx"
Cohesion: 0.09
Nodes (43): AuthCard(), GoogleSignInButton(), GoogleSignInButtonProps, styles, src_components_index_authcard, src_components_index_button, src_components_index_googlesigninbutton, src_components_index_input (+35 more)

### Community 3 - "AuthContext.tsx"
Cohesion: 0.07
Nodes (33): RFC-4122, AppConfig, config, AuthContextType, AuthProvider(), mockUser, generateRequestId(), RequestOptions (+25 more)

### Community 4 - "package.json"
Cohesion: 0.05
Nodes (40): dependencies, expo, expo-secure-store, expo-status-bar, react, react-native, react-native-safe-area-context, react-native-screens (+32 more)

### Community 5 - "RootNavigator.tsx"
Cohesion: 0.11
Nodes (22): expo-secure-store, AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider(), useOnboarding(), AuthLoadingScreen(), OnboardingScreen() (+14 more)

### Community 6 - "expo"
Cohesion: 0.09
Nodes (21): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+13 more)

### Community 7 - "BottomTabNavigator.tsx"
Cohesion: 0.16
Nodes (10): @react-navigation/bottom-tabs, BottomTabNavigator(), styles, Tab, TabIconWithDotProps, AuthStackNavigationProp, MainTabNavigationProp, MainTabParamList (+2 more)

### Community 8 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+4 more)

### Community 9 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

## Knowledge Gaps
- **162 isolated node(s):** `AppProvidersProps`, `ErrorBoundaryProps`, `ErrorBoundaryState`, `AuthCardProps`, `ButtonProps` (+157 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 191 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `theme/index.ts` to `HomeScreen.tsx`, `SignInScreen.tsx`, `AuthContext.tsx`, `package.json`, `RootNavigator.tsx`, `BottomTabNavigator.tsx`?**
  _High betweenness centrality (0.196) - this node is a cross-community bridge._
- **Why does `react` connect `theme/index.ts` to `HomeScreen.tsx`, `SignInScreen.tsx`, `AuthContext.tsx`, `package.json`, `RootNavigator.tsx`, `BottomTabNavigator.tsx`?**
  _High betweenness centrality (0.142) - this node is a cross-community bridge._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **What connects `AppProvidersProps`, `ErrorBoundaryProps`, `ErrorBoundaryState` to the rest of the system?**
  _162 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `theme/index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06101834673263245 - nodes in this community are weakly interconnected._
- **Should `HomeScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07139079851930195 - nodes in this community are weakly interconnected._
- **Should `SignInScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08552188552188553 - nodes in this community are weakly interconnected._