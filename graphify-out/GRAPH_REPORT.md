# Graph Report - PitchMint-mobile  (2026-10-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 483 nodes · 1234 edges · 21 communities (19 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cc9cab0c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- react-native
- apiClient.ts
- ResetPasswordScreen.tsx
- BottomTabNavigator.tsx
- steps
- graphify-update.yml
- expo
- package.json
- ValidateModalScreen.tsx
- ProfileScreen.tsx
- HomeScreen.tsx
- updates
- react
- ActivityScreen.tsx
- ideasApi.ts
- scripts
- app/App.tsx
- dependencies
- tsconfig.json
- AppErrorBoundary

## God Nodes (most connected - your core abstractions)
1. `react-native` - 44 edges
2. `react` - 43 edges
3. `Icon()` - 21 edges
4. `useAuth()` - 18 edges
5. `ApiError` - 17 edges
6. `Colors` - 16 edges
7. `@react-navigation/native` - 16 edges
8. `Button()` - 13 edges
9. `@react-navigation/native-stack` - 13 edges
10. `expo` - 13 edges

## Surprising Connections (you probably didn't know these)
- `IdeasScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/ideas/screens/IdeasScreen.tsx → src/services/api/ideasApi.ts
- `HomeScreen()` --indirect_call--> `mapBackendIdeaToCard()`  [INFERRED]
  src/features/home/screens/HomeScreen.tsx → src/services/api/ideasApi.ts
- `BadgeProps` --references--> `Tone`  [EXTRACTED]
  src/components/Badge.tsx → src/theme/colors.ts
- `InputProps` --references--> `IconName`  [EXTRACTED]
  src/components/Input.tsx → src/components/Icon.tsx
- `PillProps` --references--> `Tone`  [EXTRACTED]
  src/components/Pill.tsx → src/theme/colors.ts

## Import Cycles
- None detected.

## Communities (21 total, 2 thin omitted)

### Community 0 - "react-native"
Cohesion: 0.06
Nodes (51): react-native, AppProvidersProps, ErrorBoundaryProps, ErrorBoundaryState, styles, AuthCardProps, styles, BadgeProps (+43 more)

### Community 1 - "apiClient.ts"
Cohesion: 0.08
Nodes (33): RFC-4122, GoogleLogo(), GoogleSignInButtonProps, styles, AuthContextType, AuthProvider(), mockUser, apiClient (+25 more)

### Community 2 - "ResetPasswordScreen.tsx"
Cohesion: 0.13
Nodes (38): @react-navigation/native, @react-navigation/native-stack, AuthCard(), Button(), GoogleSignInButton(), Icon(), Input(), useAuth() (+30 more)

### Community 3 - "BottomTabNavigator.tsx"
Cohesion: 0.07
Nodes (31): react-native-safe-area-context@~5.7.0, expo-secure-store, react-native-safe-area-context, AuthContext, OnboardingContext, OnboardingContextType, OnboardingProvider(), useOnboarding() (+23 more)

### Community 4 - "steps"
Cohesion: 0.08
Nodes (23): concurrency, cancel-in-progress, group, EXPO_PUBLIC_API_URL, jobs, validate, name, branches (+15 more)

### Community 5 - "graphify-update.yml"
Cohesion: 0.08
Nodes (23): concurrency, cancel-in-progress, group, jobs, update-graph, name, permissions, contents (+15 more)

### Community 6 - "expo"
Cohesion: 0.09
Nodes (21): backgroundColor, backgroundImage, foregroundImage, monochromeImage, adaptiveIcon, predictiveBackGestureEnabled, expo, android (+13 more)

### Community 7 - "package.json"
Cohesion: 0.13
Nodes (21): devDependencies, jest@^29.7.0, jest-expo@^57.0.6, @testing-library/react-native@^14.1.0, @types/jest@^29.5.14, @types/node@^26.6.5, @types/react@~19.2.2, @types/react-test-renderer@^19.3.0 (+13 more)

### Community 8 - "ValidateModalScreen.tsx"
Cohesion: 0.13
Nodes (15): ANALYZING_STEPS, ModalStage, styles, TIPS, ValidateModalScreen(), mockGoBack, mockNavigate, mockRefreshUser (+7 more)

### Community 9 - "ProfileScreen.tsx"
Cohesion: 0.13
Nodes (10): AppConfig, config, DEMO_PLANS, ProfileScreen(), SettingRow(), SettingRowProps, styles, mockRefreshUser (+2 more)

### Community 10 - "HomeScreen.tsx"
Cohesion: 0.20
Nodes (8): NavigationProp, styles, FilterType, NavigationProp, styles, formatDisplayDate(), formatDisplayDateTime(), formatRelativeTime()

### Community 11 - "updates"
Cohesion: 0.12
Nodes (15): prefix, patterns, development-dependencies, day, interval, time, timezone, updates (+7 more)

### Community 12 - "react"
Cohesion: 0.15
Nodes (11): react, mockClearError, mockNavigate, mockRouteParams, mockSignIn, HomeScreen(), mockNavigate, mockRefreshUser (+3 more)

### Community 13 - "ActivityScreen.tsx"
Cohesion: 0.27
Nodes (11): Card(), IconBadge(), Pill(), ScreenContainer(), ActivityScreen(), getServiceVisuals(), styles, activityApi (+3 more)

### Community 14 - "ideasApi.ts"
Cohesion: 0.26
Nodes (10): BackendIdea, GetSavedIdeasParams, ideasApi, mapBackendIdeaToCard(), SavedIdeasResponse, SubmitIdeaRequest, SubmitIdeaResponse, hasSubDocument() (+2 more)

### Community 15 - "scripts"
Cohesion: 0.17
Nodes (12): scripts, android, doctor, export:android, graphify:extract, graphify:html, graphify:update, ios (+4 more)

### Community 16 - "app/App.tsx"
Cohesion: 0.24
Nodes (7): expo@~57.0.31, expo-status-bar@~57.0.1, expo, expo-status-bar, App(), AppProviders(), navigationDarkTheme

### Community 17 - "dependencies"
Cohesion: 0.20
Nodes (10): dependencies, expo-secure-store@~57.0.4, react@19.2.3, react-native@0.86.3, react-native-screens@~4.26.0, @react-navigation/bottom-tabs@^7.20.0, @react-navigation/native@^7.5.0, @react-navigation/native-stack@^7.20.0 (+2 more)

### Community 18 - "tsconfig.json"
Cohesion: 0.33
Nodes (5): expo/tsconfig.base, compilerOptions, strict, types, extends

## Knowledge Gaps
- **2 isolated node(s):** `RFC-4122`, `expo/tsconfig.base`
  These have ≤1 connection - possible missing edges. (Counts symbols only; 214 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react-native` connect `react-native` to `apiClient.ts`, `ResetPasswordScreen.tsx`, `BottomTabNavigator.tsx`, `package.json`, `ValidateModalScreen.tsx`, `ProfileScreen.tsx`, `HomeScreen.tsx`, `react`, `ActivityScreen.tsx`, `dependencies`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **What connects `RFC-4122`, `expo/tsconfig.base` to the rest of the system?**
  _2 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `react-native` be split into smaller, more focused modules?**
  _Cohesion score 0.060534822215692036 - nodes in this community are weakly interconnected._
- **Why does `react` connect `react` to `react-native`, `apiClient.ts`, `ResetPasswordScreen.tsx`, `BottomTabNavigator.tsx`, `package.json`, `ValidateModalScreen.tsx`, `ProfileScreen.tsx`, `HomeScreen.tsx`, `ActivityScreen.tsx`, `app/App.tsx`, `dependencies`?**
  _High betweenness centrality (0.106) - this node is a cross-community bridge._
- **Should `apiClient.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08163265306122448 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `package.json`?**
  _High betweenness centrality (0.036) - this node is a cross-community bridge._
- **Should `ResetPasswordScreen.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.13350340136054423 - nodes in this community are weakly interconnected._