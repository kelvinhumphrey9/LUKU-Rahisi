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
