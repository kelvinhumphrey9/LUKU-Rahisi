# Palette's Journal - Critical Learnings Only

## 2026-07-22 - Hybrid Loading State Accessibility & Interactive Recovery
**Learning:** Initial application load and loading screens are often treated as static visual placeholders, lacking screen-reader support (e.g., `accessibilityLiveRegion="polite"`) and interactive recovery options (e.g. `Pressable` manual retries). For assistive technologies and keyboard-only users, this creates a black-hole state with no announcement of active loading or progress.
**Action:** Always wrap initial load / fallback states in dynamic live regions, use specific `accessibilityLabel` annotations, and supply an elegant, keyboard-navigable and highly tactile retry/refresh trigger with state-driven visual feedback (such as color shifts, scale changes on press, and explicit disabled states).

## 2026-07-23 - Micro-UX feedback and Keyboards Focus States
**Learning:** Manual triggers for status re-evaluation can leave users unsure whether the action succeeded if the visual state reverts instantly to the previous resting state. Additionally, keyboard users struggle to navigate web applications when default focus indicators are hidden by standard resets without a high-visibility replacement.
**Action:** Always follow up asynchronous state checks with clear, delightful, and accessible inline feedback (such as an alert-role badge) indicating success. Combine this with explicit, custom focus rings (e.g., using `Pressable`'s `focused` state) to preserve full accessibility on both mobile and web hybrid architectures.

## 2026-07-25 - Localized UX and Cultural Accessibility (LUKU)
**Learning:** Providing high-quality Swahili (Kiswahili) localization in Tanzanian utilities like electricity purchase (LUKU) significantly lowers cognitive load and builds trust for regional users. Screen readers must be supplied with corresponding translated `accessibilityLabel` attributes to prevent English-centric voice engines from mispronouncing local terms.
**Action:** Always map local terminology (e.g. LUKU) in translations and ensure all interactive elements switch both visible texts and screen-reader accessibility labels simultaneously.

## 2026-07-26 - Safe Hybrid Clipboard Access
**Learning:** Top-level package imports like `expo-clipboard` can contain raw JSX or non-web standard components (such as `ClipboardPasteButton.js` in JS format) that break Vite web bundlers. Directly importing core module replacements like `Clipboard` from `react-native` will also cause iOS/Android crashes on newer React Native versions where it was completely removed from core.
**Action:** Always wrap modern Clipboard actions in platform conditional checks (e.g., `Platform.OS === 'web'`), fall back to web native `navigator.clipboard`, and use dynamic `require` at runtime only on native device checks to completely prevent bundler parsing/runtime failures.

## 2026-07-28 - Dynamic Status Messaging & Disabled Action Tooltips
**Learning:** Displaying generic "Loading..." or "Rechecking..." messages when the application is in an idle resting state creates a perpetual loading anti-pattern that confuses users into thinking background processes are stuck. Furthermore, leaving disabled action buttons without explicit state-driven tooltips (e.g. `accessibilityHint` / `title`) leaves screen reader and hover users without context as to why an action is temporarily blocked.
**Action:** Always provide a clear, localized resting status message (such as "System Ready" / "Mfumo Uko Tayari") when idle, and update `accessibilityHint` and `title` attributes dynamically when buttons transition into disabled processing states.

## 2026-08-26 - Screen Reader Grouping & Inline Processing Affordances
**Learning:** Visual text controls (like language toggles separated by decorative pipe characters) can create repetitive screen-reader announcements if decorative characters aren't hidden via `aria-hidden={true}` and interactive options aren't semantically grouped (`accessibilityRole="radiogroup"`). Furthermore, providing tactile inline spinners (`ActivityIndicator`) inside action buttons during processing states gives instant visual feedback directly at the user's point of interaction.
**Action:** Always wrap grouped option toggles in semantic ARIA container roles, hide purely visual text separators from screen readers, and provide inline activity indicators inside action buttons during processing states.

## 2026-10-14 - Global Control Keyboard Shortcut & Visual Keycap Badge Affordance
**Learning:** Keypad/keyboard navigation users benefit immensely from explicit global keyboard shortcuts (e.g., 'R' for refresh) for primary application triggers. To prevent duplicate or cluttered screen reader announcements, decorative keycap badges (e.g. `[R]`) should be explicitly hidden with `aria-hidden={true}` while updated `accessibilityHint` properties clearly communicate keyboard shortcut availability across localized languages.
**Action:** Pair global event listeners with styled keycap badges (`aria-hidden={true}`) and update interactive button `accessibilityHint` strings with keyboard shortcut hints.

## 2026-10-15 - Dynamic Language Phonetics & Visual Alert Dismiss Affordance
**Learning:** Dismissable alert notifications with keyboard shortcuts (such as Escape) benefit from visual keycap badges (`[Esc]`) marked `aria-hidden={true}` next to dismiss icons (`✕`), preventing redundant screen reader announcements while giving desktop keyboard users immediate visual affordance. Additionally, setting `lang={lang}` on top-level views ensures voice synthesizers dynamically switch pronunciation phonetics.
**Action:** Always add `aria-hidden={true}` keycap badges for keyboard shortcuts on dismiss controls and pass `lang={lang}` attributes to top-level containers.

## 2026-10-16 - Keyboard Shortcut Legend Footer & Global Language Shortcut
**Learning:** Pairing global control toggles (such as language selection) with keyboard shortcuts (e.g., `L`) and visual keycap badges `[L]` improves efficiency for keyboard users. Adding a centralized, localized keyboard shortcut legend footer (`[R] Refresh • [L] Language • [Esc] Dismiss`) with `accessibilityRole="summary"` (or `region`) and `accessibilityLabel` gives visible affordance while preventing screen readers from redundantly announcing keycap badge text when `accessibilityHint` already describes the shortcut key.
**Action:** Always provide visual keycap badges with `aria-hidden={true}` for interactive shortcut triggers and render a localized keyboard shortcut legend footer for enhanced keyboard user affordance.

## 2026-10-22 - Resting Online Status Pill & Persistent Verification Timestamp
**Learning:** Pairing live status text with a high-contrast resting status pill badge (`● Online` / `● Mtandaoni`) provides immediate visual reassurance of connectivity without cluttering screen-reader announcements when bullet glyphs are marked `aria-hidden={true}`. Furthermore, embedding the verified timestamp into the resting status pill ensures users maintain persistent context of system status freshness even after top-level success alert banners auto-dismiss.
**Action:** Always render a resting status pill badge with `aria-hidden={true}` bullet glyphs and include persistent verified timestamps to avoid feedback vacuums after temporary alerts disappear.

## 2026-10-23 - Language Selector Radio Semantics & Disabled Cursor Affordance
**Learning:** Options inside an explicit `accessibilityRole="radiogroup"` container should specify `accessibilityRole="radio"` rather than `accessibilityRole="button"` to ensure screen readers communicate correct selection context and option counts. Furthermore, passing explicit `lang={langCode}` directly on language buttons guarantees TTS synthesizers switch voice phonetics per option label, while adding `cursor: "not-allowed"` on web views provides visual feedback when interactive triggers enter disabled processing states.
**Action:** Set `accessibilityRole="radio"` on option triggers inside radio groups, pass explicit `lang={langCode}` props for native language labels, and apply `cursor: "not-allowed"` to disabled interactive elements.

## 2026-10-29 - Segment Checklist & Progress Ratio for Long Numeric Utility Tokens
**Learning:** For long 20-digit utility tokens (such as LUKU electricity codes) entered manually into physical hardware keypads, users suffer high cognitive load and frequent transcription errors. Providing interactive, checkable segment chips (`accessibilityRole="checkbox"`) paired with a real-time progress ratio (`Progress: 2/5 entered` / `Hatua: 2/5 imewekwa`) and an accessible reset trigger eliminates feedback vacuums and visual layout anxiety during manual keypad entry.
**Action:** Always render long multi-segment numeric codes as interactive checkable chips with semantic ARIA checkbox roles and dynamic progress feedback.
