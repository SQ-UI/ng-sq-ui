---
name: sq-ui-table
description: Compose ng-sq-ui tables with search, filters, sorting, pagination and row actions.
---

Read the datatable, paginator and projected-template APIs. Decide who owns sorting and paging. Built-in rows can use the component's automatic behavior; custom bodies own their row iteration and must not duplicate automatic items.

Use the CRUD recipe for caller-owned search, status filtering, deterministic sorting and actions. Reset or clamp the page after dataset/filter changes. Keep sort controls available on mobile, where table headers may be hidden.

Verify sorting across the full filtered collection, page boundaries, no results, deletion on the last page and edit/save consistency. Server-backed data needs an explicit query/total contract.
