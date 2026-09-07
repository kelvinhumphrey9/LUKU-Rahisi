# Palette's Journal - Critical Learnings Only

## 2026-08-31 - Auto-Dismissing Notification Pause-on-Hover/Focus & Keyboard Shortcut Micro-UX
**Learning:** Automatically dismissing status badges after a fixed timeout can cause users reading the notification or attempting to click dismiss to lose context prematurely (WCAG 2.2 SC 2.2.1). Additionally, omitting visual keyboard shortcut hints leaves keyboard users unaware of dismiss shortcuts like `Escape`.
**Action:** Always pause auto-dismiss timers when users hover or focus on floating notifications, resume the timer when focus/hover leaves, and explicitly include shortcut hints (such as `(Esc)`) in accessibility hints and tooltips.

## 2026-09-05 - Processing Button Busy State Accessibility
**Learning:** Setting `busy: true` (ARIA `aria-busy="true"`) on disabled processing buttons provides explicit semantic feedback to screen readers that an asynchronous operation is in progress on that specific control.
**Action:** Include `busy: true` in `accessibilityState` when an interactive element transitions into a temporary disabled loading or retrying state.
