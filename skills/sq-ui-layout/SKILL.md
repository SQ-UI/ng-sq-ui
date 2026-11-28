---
name: sq-ui-layout
description: Compose an ng-sq-ui application shell with navigation and responsive page content.
---

Use `list_blueprints` and the Navbar/Card APIs. Plan navigation and routes together; keep generated feature routes under their own prefix when adding to an existing application.

Provide a skip link, named navigation, active-route indication and a main landmark. A mobile menu needs an accessible toggle, Escape closing and focus return. Use minmax(0, 1fr), min-width: 0 and logical spacing to prevent content overflow.

Generate the shell with `generate_ui`, then verify navigation at phone and desktop widths. Header, sidebar and overlays must inherit the same theme.
