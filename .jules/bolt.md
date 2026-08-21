## 2025-05-18 - Isolated RefreshButton Sub-component
**Learning:** Extracting inline Pressable style callbacks and state from parent components into dedicated sub-components wrapped in `React.memo` isolates dynamic style evaluation and eliminates redundant closure/array allocations on every parent render cycle.
**Action:** When components contain interactive elements with dynamic hover/focus/press style callbacks, isolate them into standalone memoized sub-components to reduce GC overhead and prevent unnecessary Virtual DOM diffing.
