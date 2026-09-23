# Bolt Journal - Performance Optimizations

## 2026-02-02 - Avoiding Unnecessary Object Allocation in useRef Initializers
**Learning:** Passing inline object literals or non-primitive initial values directly to `useRef(initialValue)` evaluates and allocates a new object on every single component render pass, even though `useRef` only uses the initial argument during the very first mount render. Initializing mutable state refs with `null` (`useRef<T | null>(null)`) and populating `ref.current` inside `useEffect` avoids garbage collection (GC) pressure and unnecessary heap allocations on every re-render.
**Action:** Prefer `useRef(null)` over inline object initializers `useRef({ ... })` when tracking mutable render values in React components.

## 2026-02-02 - Hoisting Pressable Style Callbacks to Module Scope
**Learning:** In React Native Web, defining Pressable `style` callbacks dynamically inside components or `useCallback` hooks recreates function instances and style arrays on state updates. Hoisting static style callbacks (or state-indexed callbacks) to module scope outside component render bodies guarantees O(1) referential stability for Pressable style props and completely eliminates `useCallback` hook invocation overhead on every render pass.
**Action:** Prefer hoisting static or state-conditional Pressable style callbacks to module scope outside functional components.
