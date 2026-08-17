## 2026-08-17 - Interactive Token Code Copy & Collapsible State
**Learning:** Making raw utility token strings interactive (Pressable) with hover, focus, and accessibilityHint allows users to tap the token code directly to copy it, drastically improving copy speed and touch accessibility while adding `accessibilityState={expanded}` to collapsible controls ensures screen readers accurately announce expand/collapse transitions.
**Action:** Always provide interactive touch/click copy wrappers around code blocks with appropriate ARIA states and hint text.
