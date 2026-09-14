# Bolt Journal - Performance Optimizations

## 2026-02-02 - Hoisting static props and synchronous state ref synchronization
**Learning:** In React Native Web apps with global keydown listeners, updating a state ref inside `useEffect` causes an extra post-commit execution pass on every state change. Assigning to `keyHandlerStateRef.current` directly in the component render body eliminates the post-commit effect execution entirely while ensuring event handlers access fresh state synchronously.
**Action:** Prefer direct render-time assignment for state refs when binding global event handlers once on mount.
