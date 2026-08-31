## 2026-07-25 - Vite Manual Chunks for React Native Web with pnpm

**Learning:** When configuring Rollup `manualChunks` in a monorepo or pnpm environment, virtual store package paths for `react-native-web` contain sub-strings like `_react-dom@` and `_react@` in their path names. If `react-dom` or `react` chunk matchers are checked before `react-native-web`, `react-native-web` modules get mistakenly grouped into the `react-dom` chunk, leading to suboptimal chunking or circular chunk dependency warnings.

**Action:** Always place the `react-native-web` path check *before* the `react-dom` and `react` path checks inside Vite's `manualChunks` function.
