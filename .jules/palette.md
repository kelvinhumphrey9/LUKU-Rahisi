## 2026-02-02 - Keyboard Shortcut Affordance for Global Control Toggles
**Learning:** Pairing global control toggles (such as language selection) with keyboard shortcuts (e.g. `L`) and visual keycap badges `[L]` improves efficiency for power users while `aria-hidden={true}` prevents screen readers from redundantly announcing shortcut letters when `accessibilityHint` already describes the shortcut.
**Action:** Include keycap shortcut badges inside `aria-hidden` containers next to global controls and document keyboard shortcuts in `accessibilityHint`.

## 2026-02-02 - Visual Keyboard Shortcut Badge for Dismissible Alert Notifications
**Learning:** Adding a subtle, aria-hidden keycap badge (such as `[Esc]`) inside dismiss buttons for alert notifications provides immediate visual affordance to keyboard users without cluttering screen-reader announcements when `accessibilityLabel` or `accessibilityHint` already describes the keyboard shortcut.
**Action:** Always wrap visual keycap shortcut badges inside an `aria-hidden` container and pair them with explicit `accessibilityLabel` attributes to ensure high contrast, delight, and screen-reader clarity.

## 2026-02-02 - Resting State Online Connectivity Status Pill Badge
**Learning:** Pairing live status text with a compact, high-contrast 'Online' status pill badge (`● Online` / `● Mtandaoni`) provides immediate visual reassurance of service connectivity without cluttering screen reader announcements when decorative bullet glyphs are marked `aria-hidden`.
**Action:** Render status pill badges during resting states with high contrast backgrounds and hide decorative lead glyphs from screen readers using `aria-hidden={true}`.

## 2026-02-02 - Status Role and Tooltip Affordance for Connectivity Badges
**Learning:** Adding `accessibilityRole="status"`, explicit `accessibilityHint`, and web hover tooltips (`title`) to resting status pill badges ensures assistive technologies announce live status elements correctly while giving desktop users instant contextual feedback.
**Action:** Always assign `accessibilityRole="status"` with localized labels, hints, and web tooltips on live status badges.

## 2026-02-02 - Interactive Keyboard Shortcut Legend Footer
**Learning:** Converting static keyboard shortcut legend footers into interactive Pressable buttons allows touch and mouse users to trigger shortcut actions directly, while giving screen-reader and keyboard users semantic button roles, focus highlights, and tooltip hints.
**Action:** Render keyboard shortcut legend items as interactive Pressable elements with `accessibilityRole="button"`, focus outlines, and appropriate disabled states to support multi-input interaction models across touch, mouse, and keyboard.

## 2026-02-02 - Persistent Verification Timestamp on Resting Status Badges
**Learning:** Displaying the last verified timestamp directly within resting status badges (e.g. `Online • [time]`) provides persistent visual reassurance of system status freshness even after alert notifications dismiss. Pairing this with updated `accessibilityLabel` and web `title` tooltips ensures assistive technology users and hover users receive detailed timestamp context.
**Action:** Include verification timestamps directly in status badge text and update `accessibilityLabel` and web `title` tooltips when status rechecks complete.
