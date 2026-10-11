## 2026-02-02 - Hoisting Static Accessibility Objects
**Learning:** React component render cycles that instantiate new object literals for accessibility props (e.g. `{ selected: true }` or `{ disabled: true }`) or rely on `useMemo` for static boolean properties introduce unnecessary hook evaluation overhead and heap allocations. Pre-allocating static accessibility objects at module scope completely avoids re-allocations on state transitions.
**Action:** Hoist static accessibility state objects to module scope outside functional components instead of allocating inline or calling `useMemo`.
