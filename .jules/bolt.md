# Bolt Journal - Performance Optimizations

## 2026-02-02 - Hoisting Pressable Style Callbacks to Module Scope
**Learning:** In React Native Web, defining Pressable `style` callbacks dynamically inside components or `useCallback` hooks recreates function instances and style arrays on state updates. Hoisting static style callbacks (or state-indexed callbacks) to module scope outside component render bodies guarantees O(1) referential stability for Pressable style props and completely eliminates `useCallback` hook invocation overhead on every render pass.
**Action:** Prefer hoisting static or state-conditional Pressable style callbacks to module scope outside functional components.
