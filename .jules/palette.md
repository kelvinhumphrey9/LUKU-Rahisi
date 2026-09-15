## 2026-02-02 - Keyboard Shortcut Affordance for Global Control Toggles
**Learning:** Pairing global control toggles (such as language selection) with keyboard shortcuts (e.g. `L`) and visual keycap badges `[L]` improves efficiency for power users while `aria-hidden={true}` prevents screen readers from redundantly announcing shortcut letters when `accessibilityHint` already describes the shortcut.
**Action:** Include keycap shortcut badges inside `aria-hidden` containers next to global controls and document keyboard shortcuts in `accessibilityHint`.

## 2026-02-02 - Visual Keyboard Shortcut Badge for Dismissible Alert Notifications
**Learning:** Adding a subtle, aria-hidden keycap badge (such as `[Esc]`) inside dismiss buttons for alert notifications provides immediate visual affordance to keyboard users without cluttering screen-reader announcements when `accessibilityLabel` or `accessibilityHint` already describes the keyboard shortcut.
**Action:** Always wrap visual keycap shortcut badges inside an `aria-hidden` container and pair them with explicit `accessibilityLabel` attributes to ensure high contrast, delight, and screen-reader clarity.
