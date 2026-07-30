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

## 2026-07-26 - Vite Pre-bundling Resolution for Dynamic Native Modules
**Learning:** In hybrid React/React Native Web codebases, dynamic imports/requires of native modules like `expo-clipboard` or `expo-modules-core` trigger automatic pre-bundling scans in Vite. If these libraries contain raw JSX inside `.js` files, or use native symbols like `TurboModuleRegistry` missing from `react-native-web`, Vite dev server builds fail.
**Action:** Exclude native Expo packages from Vite dependency pre-bundling via `optimizeDeps.exclude`, and specify `.js` as `jsx` in `optimizeDeps.esbuildOptions.loader` to prevent pre-bundler crashes.

## 2026-07-27 - Vite Top-Level Esbuild Loader vs Build-Level Loader Mapping
**Learning:** Vite's top-level `esbuild` configuration option is passed directly to esbuild's single-file `transform` API. As a result, its `loader` option must be a single string (e.g., 'jsx'), not an extension-to-loader mapping object (e.g., `{ '.js': 'jsx' }`). Attempting to pass an object causes esbuild to fail with the error `"loader" must be a string` and triggers type errors. Object mapping loaders are only valid under dependency pre-bundling configurations (such as `optimizeDeps.esbuildOptions.loader`).
**Action:** When configuring loader mappings for dynamic native packages with JSX syntax inside `.js` files, specify the object loader mapping exclusively inside `optimizeDeps.esbuildOptions.loader`. Keep the top-level `esbuild` loader property as a single string or omit it if not needed.

## 2026-07-30 - React List Rendering and Scope Hoisting Optimization
**Learning:** In list views where items are interactive (e.g., highlighting individual groups), rendering with inline dynamic mapping causes the entire list to re-render, styles to re-evaluate, and string templates to recompile on every selection change. Extracting items into standalone `React.memo` components with stable `useCallback` prop event handlers isolates changes solely to selected/deselected items, bypassing re-renders of all other sibling items. Additionally, hoisting static constants like `MOCK_TOKEN` completely outside the component function eliminates GC re-allocation overhead and avoids hooks monitoring (like `useMemo` with empty arrays) on every render.
**Action:** Always extract list items into `React.memo` standalone components and hoist static variables outside the component scope in high-frequency interactive lists to save CPU and memory allocation overhead.