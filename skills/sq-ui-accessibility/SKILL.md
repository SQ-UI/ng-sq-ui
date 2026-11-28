---
name: sq-ui-accessibility
description: Check ng-sq-ui labels, contrast, keyboard interaction and focus management.
---

Use the exact component contracts and the generated theme's contrast diagnostics. `preview_ui` runs axe alongside runtime and overflow checks. Fix the reported targets and rerun the affected scenario.

Manually exercise Tab/Shift+Tab, arrow keys, Enter, Space and Escape for the controls being used. Check visible focus, unique label targets, meaningful button names, invalid-submit feedback and dialog focus return.

Automated checks establish only their observed scope. Report separate browser, keyboard and assistive-technology results, and keep unrun checks visible.
