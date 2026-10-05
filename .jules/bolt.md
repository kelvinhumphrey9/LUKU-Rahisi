## 2026-02-02 - Hoisting Pressable Style Callbacks to Module Scope
**Learning:** React Native Web Pressable style callbacks that do not rely on component props or state can be hoisted to module scope as static functions. This completely eliminates `useCallback` hook invocation overhead and function re-instantiation on every render pass, preserving referential equality for Pressable style props across state transitions.
**Action:** Identify static style callback functions inside Pressable sub-components and extract them outside the component definition to module scope.
