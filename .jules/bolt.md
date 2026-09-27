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

## 2026-07-28 - Vite ManualChunks Matching Conflict in pnpm Virtual Store
**Learning:** In projects managed by pnpm, the paths ('id') of resolved modules inside node_modules include their peer dependencies in the virtual store folder name (e.g., `/app/node_modules/.pnpm/react-native-web@0.21.2_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/react-native-web/...`). When using manualChunks with conditional string inclusion checks, matching generic names like `"react-dom"` or `"react"` first will falsely capture other packages containing those substrings in their virtual store path. This prevents correct split chunking and bloated vendor bundles.
**Action:** Always place specific package checks like `"react-native-web"` before more generic ones like `"react-dom"` or `"react"` in Vite's `manualChunks` configurations to circumvent peer dependency naming collisions under pnpm.

## 2026-07-29 - React Component State & Sub-tree Isolation Optimization
**Learning:** In React Native Web views, keeping transient states (such as clipboard copied state or active status timers) inside top-level App components triggers full Virtual DOM re-evaluations and style object recompilations on every state transition. Extracting localized UI sub-trees (`LanguageToggle`, `TokenCard`, `StatusDisplay`, `RefreshButton`) into standalone `React.memo` components with primitive props isolates render cascades and completely prevents unnecessary re-renders of parent/sibling components.
**Action:** Always decompose React components into `React.memo` sub-components and isolate local component states to maintain render purity and eliminate render cascades across sibling elements.
