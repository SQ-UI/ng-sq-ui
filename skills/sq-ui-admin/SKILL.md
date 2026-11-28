---
name: sq-ui-admin
description: Generate an Angular admin application using ng-sq-ui themes and connected page recipes.
---

Use `get_overview`, `list_blueprints` and `plan_ui` with mode `application` and blueprint `admin-basic`. Specify brand, modes, locale and pages. The default application provides dashboard, user CRUD, settings, demo access and a 404 route.

Use the shared data provider so edits and deletions update both the list and dashboard. Confirm which features are requested; the CRUD recipe accepts search, filter, sort, paginate, edit and delete flags. Charts require a separately declared implementation.

Apply the generated changeset, validate the production build and exercise create/edit/cancel/delete, filters, pagination, settings, navigation and theme persistence. Report the local demo data boundary when handing over the application.
