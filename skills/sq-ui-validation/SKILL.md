---
name: sq-ui-validation
description: Validate generated ng-sq-ui applications and repair concrete build or browser diagnostics.
---

Run `validate_ui` on the applied artifact. Dependency installation is explicit through its install option. Poll `get_job` until complete or failed; inspect both the job and report statuses.

Repair errors using the exact registry API, then repeat the affected checks. A template syntax parse does not replace strict Angular compilation. Run `preview_ui` for requested routes, widths and themes, and examine screenshots as well as diagnostics.

Use `cancel_job` to stop an obsolete run and `stop_preview` when a live preview is no longer needed. Handover includes artifact paths, commands and the actual passed/failed/not-run checks.
