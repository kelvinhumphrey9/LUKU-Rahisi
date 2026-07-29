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

## 2026-07-29 - Interactive Digit Group Selection for External Keypad Entry
**Learning:** For utility and financial applications where users must manually transfer a long code (such as a 20-digit LUKU token) from their screen onto a separate physical device (like a CIU meter keypad), users suffer high cognitive load and frequently lose their place. A simple static code representation is highly prone to input errors.
**Action:** Split long numerical codes into tactile, pressable sub-groups (e.g. 4-digit chunks) allowing users to interactively tap and highlight the current segment they are typing. For screen-readers, translate and map each digit with single-space spacing inside the accessibility labels (e.g. `1 5 0 8`) to force individual digit pronunciation rather than continuous long number pronunciation.
