---
name: sq-ui-overlays
description: Compose ng-sq-ui dialogs, dropdowns and tooltips with correct focus and dismissal behavior.
---

Read the chosen component API and its projected sections. Give dialogs a meaningful projected title. On opening, move focus inside; keep Tab within a modal, handle Escape only for the active modal, restore focus on closing and lock background scrolling.

Dropdown selection and keyboard focus are separate states. Check arrow movement, disabled options, Enter selection, Escape dismissal and announcements. Tooltips must work on keyboard focus and preserve Escape handling before a containing modal closes.

Keep overlays inside their intended theme inheritance boundary and inspect clipping, z-order and viewport overflow. Exercise real browser keyboard behavior in addition to unit checks.
