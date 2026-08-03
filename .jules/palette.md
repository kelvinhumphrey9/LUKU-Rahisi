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

## 2026-07-28 - Tooltip/Title Attributes in TypeScript-Strict Native-Web Hybrid
**Learning:** Adding web-standard hover-tooltips (the `title` attribute) on `Pressable` components in a shared mobile/web React Native codebase triggers strict TS compiler errors because React Native's static `PressableProps` interfaces do not define `title`.
**Action:** Safely inject standard browser attributes (like `title` or custom ARIA regions) by spreading a casted object, e.g., `{...({ title: tooltipText } as any)}`. This preserves compile-time safety and prevents compilation crashes on the web target while successfully injecting the attribute into the DOM.

## 2026-07-29 - Segment Completion Checklist for Long Numerical Codes
**Learning:** Entering long, critical codes (such as a 20-digit LUKU utility token) onto physical keypad hardware from a screen is extremely error-prone as users easily lose their place mid-entry. Adding a tactile, interactive checkpoint feature to the token badges allows users to click or tap segments to mark them as completed, acting as an active visual checklist.
**Action:** Always represent long sequential segments as interactive checkboxes (with corresponding ARIA states and localized check state readouts) so physical keypad entry can be tracked step-by-step with state-driven visual feedback (such as text strike-throughs and background color shifts).

## 2026-08-02 - Chunked Visual Scanning & Keypad Mode for Utility Tokens
**Learning:** Utility purchase applications often present long numerical tokens (e.g. 20-digit LUKU tokens) in plain text or with static hyphens. This increases cognitive load and transcription error rates when users manually type the token onto physical utility keypads, as most keypads do not have hyphen buttons.
**Action:** Present long tokens as visually segmented, distinct 4-digit groups (cards/badges) to aid manual visual scanning. Pair this with a highly visible "Keypad Mode" toggle that hides hyphens/separators and updates the clipboard copy utility to export a clean, raw numeric string for direct manual or automated use.
