# Palette UX Journal - Critical Learnings

## 2026-10-06 - Header Accessibility & Language Phonetics
**Learning:** Setting `accessibilityRole="header"` and `aria-level={1}` on title text elements establishes semantic heading structure for screen readers, while setting explicit `lang` attributes on language selector controls ensures accurate text-to-speech pronunciation phonetics.
**Action:** When adding language toggle controls or app title text, always provide explicit `lang` attributes on language options and semantic `header` roles on titles.
