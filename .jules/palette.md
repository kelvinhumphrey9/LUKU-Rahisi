## 2026-02-02 - Keyboard Shortcut Affordance for Global Control Toggles
**Learning:** Pairing global control toggles (such as language selection) with keyboard shortcuts (e.g. `L`) and visual keycap badges `[L]` improves efficiency for power users while `aria-hidden={true}` prevents screen readers from redundantly announcing shortcut letters when `accessibilityHint` already describes the shortcut.
**Action:** Include keycap shortcut badges inside `aria-hidden` containers next to global controls and document keyboard shortcuts in `accessibilityHint`.

## 2026-02-02 - Visual Keyboard Shortcut Badge for Dismissible Alert Notifications
**Learning:** Adding a subtle, aria-hidden keycap badge (such as `[Esc]`) inside dismiss buttons for alert notifications provides immediate visual affordance to keyboard users without cluttering screen-reader announcements when `accessibilityLabel` or `accessibilityHint` already describes the keyboard shortcut.
**Action:** Always wrap visual keycap shortcut badges inside an `aria-hidden` container and pair them with explicit `accessibilityLabel` attributes to ensure high contrast, delight, and screen-reader clarity.

## 2026-02-02 - Interactive Keyboard Shortcut Legend Items
**Learning:** Rendering keyboard shortcut legend items as interactive `<Pressable>` triggers with `accessibilityRole="button"`, localized labels/hints, web `title` tooltips, hover/focus states, and disabled states enables mouse and touch users to trigger shortcut actions directly while providing explicit screen-reader affordances.
**Action:** Wrap keyboard shortcut legend items in `<Pressable>` with semantic button roles, localized hints, and visual hover/focus indicators.

## 2026-02-02 - Disabled State Affordance and Non-Redundant Screen Reader Announcements
**Learning:** Concatenating `hint` into `accessibilityLabel` when `accessibilityHint` is already present causes screen readers to redundantly announce the instruction text twice. In addition, interactive elements with disabled states need `cursor: "not-allowed"`, disabled hover prevention, and container dimming so keycap badges and labels consistently reflect unavailability.
**Action:** Disambiguate `accessibilityLabel` from `accessibilityHint`, and apply `cursor: "not-allowed"` and container dimming when `disabled` is true.

## 2026-02-02 - Decorative Icon Grouping and Disabled Tooltip Affordance
**Learning:** Marking purely decorative badge icon containers as `aria-hidden={true}` prevents screen readers from repeating status text twice when status text is displayed immediately below the badge. In addition, suppressing hover tooltips (`title`) on disabled shortcut triggers prevents misleading mouse affordances when the corresponding action is unavailable.
**Action:** Use `aria-hidden={true}` on decorative icon containers paired with visible text, and suppress `title` hover tooltips on disabled interactive triggers when actions are inactive.
