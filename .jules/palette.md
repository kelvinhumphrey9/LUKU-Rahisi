## 2026-10-19 - Screen Reader Spelling for Numerical Utility Tokens
**Learning:** Screen readers often pronounce 20-digit numerical utility tokens (such as LUKU tokens) as huge numbers (e.g., 'one billion...'), making manual keypad entry confusing. Mapping digits separated by spaces inside `accessibilityLabel` (`.split('').join(' ')`) prompts voice synthesizers to spell each digit individually, significantly improving manual entry accuracy.
**Action:** Always format long numeric tokens with space-separated `accessibilityLabel` strings when displaying utility codes.
