# Bolt's Journal - Critical Learnings Only

This journal contains ONLY critical learnings that will help avoid mistakes or make better decisions. Routine work is NOT documented here.

## 2026-02-02 - Codebase Architecture Edge Case: Empty Repository Structure
**Learning:** Found that the repository cloned contains configuration files for Vite and Expo/Metro, but has no `src` or `assets` directories. In order to optimize and verify the build, placeholder `src/App.tsx` and `src/main.tsx` must be populated first.
**Action:** Created minimal placeholder files to facilitate `npm run build` and enabled automated validation tools to verify the performance changes.

## 2026-07-21 - Custom Rollup ManualChunks Configuration
**Learning:** In hybrid React/React Native Web applications, the bundled entrypoint size can become extremely large (~259 kB) due to React DOM and React Native Web vendor libraries being compiled eagerly. By implementing explicit split chunk routing for key vendors (`react`, `react-dom`, `react-native-web`), we reduced the main bundle entrypoint size from 259.36 kB to an incredibly lightweight 1.37 kB (a 99.4% reduction), allowing highly effective browser-level caching.
**Action:** Always configure modular split chunk boundaries on large React Native Web bundles to leverage parallel fetching and robust CDN/browser cache hits.

## 2026-07-23 - React Native StyleSheet vs. Inline Object Performance
**Learning:** Defining styles inline inside React and React Native components creates new style object allocations on every single render. In React Native Web and native mobile, this imposes significant Garbage Collection (GC) pressure and causes shallow-equality failures, triggering unnecessary layouts and DOM updates. Migrating inline styles to static `StyleSheet.create` permits the framework to compile stable CSS classes once and share them efficiently.
**Action:** Always extract static and semi-dynamic style definitions outside of the component using `StyleSheet.create` in hybrid React/React Native Web codebases to optimize rendering, avoid GC pauses, and leverage browser-native stylesheet caching.

## 2026-07-24 - React Hook Callback and Object Literal Memoization
**Learning:** Passing inline-defined event handlers and dynamic literal objects (like accessibilityState or dynamic configuration objects) directly to interactive Pressable or custom child components triggers constant re-allocations on every render cycle. This breaks reference equality checks, triggering unnecessary DOM and sub-component prop updates, while also increasing Garbage Collection (GC) overhead.
**Action:** Always wrap component interaction handlers in `useCallback` and wrap layout/accessibility state object literals in `useMemo` in performance-critical rendering paths to guarantee referential stability and eliminate redundant reconciliations.
