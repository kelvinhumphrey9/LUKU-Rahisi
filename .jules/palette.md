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
