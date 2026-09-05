## 2026-07-25 - Vite Manual Chunks for React Native Web with pnpm

**Learning:** When configuring Rollup `manualChunks` in a monorepo or pnpm environment, virtual store package paths for `react-native-web` contain sub-strings like `_react-dom@` and `_react@` in their path names. If `react-dom` or `react` chunk matchers are checked before `react-native-web`, `react-native-web` modules get mistakenly grouped into the `react-dom` chunk, leading to suboptimal chunking or circular chunk dependency warnings.

**Action:** Always place the `react-native-web` path check *before* the `react-dom` and `react` path checks inside Vite's `manualChunks` function.

## 2026-07-25 - Stable Event Listener Registration via Mutable Ref

**Learning:** Global `window` event listeners (such as keyboard listeners) in React components that depend on frequently updating state (e.g. status retry, auto-dismiss timers) will repeatedly unbind and re-bind event listeners to the DOM on every state transition if state variables are listed in `useEffect` dependencies. Using a mutable `useRef` to hold the latest state references allows binding `window.addEventListener` once on mount, eliminating global DOM event listener churn and GC pressure across state updates.

**Action:** Store changing event callback state in a `useRef` updated during renders/effects, and pass empty dependencies `[]` to the `useEffect` that manages global `window` event listeners.
