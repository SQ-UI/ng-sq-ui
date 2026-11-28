# ng-sq-ui MCP server

The server implements the ng-sq-ui documentation, theme and UI generation workflow described in the [implementation plan](../mcp-server-plan.md). Its registry is generated from public exports and shares example metadata and code generation with the Angular demo.

## Build and connect

Use Node from `.nvmrc` and install both dependency sets:

```sh
npm ci
npm ci --prefix tools/mcp-server
npm run build:libs
npm run mcp:build
node tools/mcp-server/build/cli.js doctor --workspace .
```

For a client that accepts JSON MCP configuration, use an absolute Node executable and an absolute path to the built entry point:

```json
{
  "mcpServers": {
    "sq-ui": {
      "command": "node",
      "args": ["/absolute/path/to/ng-sq-ui/tools/mcp-server/build/cli.js", "--profile", "build", "--workspace", "/absolute/path/to/ng-sq-ui"]
    }
  }
}
```

The CLI can write the selected client's configuration using `init --client <client> --directory <configuration-root> --workspace <project>`. It preserves other servers and rejects a conflicting `sq-ui` entry. Run the client with the Node environment configured; the startup process does not install dependencies.

Documentation-only users can omit the workspace and use the default `docs` profile. Package paths are resolved relative to the installed server, so it also works outside this repository. Source builds do not establish npm publication of the library snapshot.

## Agent workflow

1. Call `get_overview` to discover the snapshot version, import map, skills and available operations.
2. Read the relevant skill and exact component APIs. `get_component_example` returns a complete standalone component and HTML.
3. Submit a structured specification to `plan_ui`. Resolve any unsupported capability or failed theme diagnostic.
4. Call `generate_ui` and inspect its files and base hashes. The output directory is relative to the registered workspace.
5. Apply the changeset using `apply_changeset`. A file changed after planning causes a conflict; a user-edited generated file is preserved.
6. Call `validate_ui`, then poll `get_job` until completion. The report distinguishes type checking and production compilation. Set `install: true` only when dependency installation is authorized.
7. Call `preview_ui` for selected routes, widths, modes and browser engine. Inspect the screenshots and diagnostics. Keep the preview open for review or call `stop_preview`.
8. Use `export_artifact` for the source directory or a tar.gz without installed dependencies and build output.

The server runs on the agent's ordinary tool loop and needs no model API key. Build and preview jobs are owned by the current process; stopping the server cancels them. Artifact metadata, changesets, themes and reports persist under `.sq-ui-mcp`.

## Generate an admin panel

Save a spec, for example:

```json
{
  "schemaVersion": 1,
  "mode": "application",
  "name": "my-admin",
  "title": "My workspace",
  "target": { "angularMajor": 22, "sqUiVersion": "3.0.2", "sourceMode": "workspace" },
  "theme": { "brand": "#00c474", "modes": ["light", "dark", "system"], "density": "comfortable" },
  "locale": "bg-BG",
  "output": { "directory": "examples/generated/my-admin" }
}
```

Call `generate_ui` with `{ "spec": ... }`, or generate directly from a file:

```sh
node tools/mcp-server/build/cli.js generate --workspace . --spec path/to/spec.json --apply
```

The default admin provides dashboard, user list, add/edit, settings, demonstration access and 404. CRUD state is shared across pages. The user list has search, status filter, sorting, pagination, deletion confirmation and loading/empty/error states. Application labels support en-US and bg-BG. Direction can be `ltr` or `rtl`.

The optional `pages` array selects page IDs, recipes and CRUD feature flags. Available recipes are `dashboard-summary`, `crud-list`, `settings-form` and `login`. Modes `page`, `example` and `theme` produce focused artifacts. Example mode requires a real component ID and can select any catalog variant.

Workspace source mode emits relative `file:` dependencies on the seven built packages in the registered workspace. For an unrelated consuming application, use installed mode with a compatible published version or supply tested package tarballs. The validation fixtures copy the public built packages into an isolated consumer and reuse the toolchain; they do not rely on TypeScript aliases to private library source.

## Existing applications

For `output.mode: "existing-project"`, set the generated source folder, `routesFile` and `stylesFile` relative to the registered workspace. The target must declare Angular 22. The route file must expose a named routes array. Generation adds a scoped route using an AST-located insertion and adds one Sass import while preserving other routes and application files. Required dependencies remain a returned plan for the consuming application.

`update_theme` plans changes to the theme and generated configuration only, preserving custom page logic. Generated file ownership is tracked by hashes. Resolve a `USER_CHANGES` or `STALE_CHANGESET` diagnostic by reviewing the affected files and replanning.

## Tools and documentation

The read-only profile exposes `get_overview`, `list_components`, `get_list_components`, `search_docs`, `get_doc_page`, `get_component_api`, `get_component_example`, `get_reference_links`, `get_cross_framework_links`, `get_migration_guide`, `list_tokens`, `list_blueprints` and `get_theme`.

The build profile adds `inspect_workspace`, `plan_ui`, `create_theme`, `update_theme`, `generate_ui`, `apply_changeset`, `validate_ui`, `preview_ui`, `stop_preview`, `get_job`, `cancel_job` and `export_artifact`.

Tool successes return `{ "ok": true, "data": ... }`; failures include `isError` and `{ "ok": false, "error": { "code", "message", "details" } }`. Job completion and validation success are separate statuses. Native MCP cancellation is respected for waiting calls; `cancel_job` handles background work.

Resources expose overview, tokens, APIs, examples, blueprints, saved themes and reports. The SDK skills extension serves the 18 skills with verified digests and also makes their files readable as resources. Five prompts guide example/page/admin/theme/migration work. Build output includes `llms.txt`, `llms-full.txt`, Markdown pages and JSON schemas under `tools/mcp-server/content`.

Reference links are conceptual equivalents in the Angular editions of CoreUI and Taiga UI. Their component APIs and code are not interchangeable with ng-sq-ui. Migration guides provide explicit steps for 1.x through 2.x to 3.x; no automatic migration is claimed.

## Validation

```sh
npm run mcp:typecheck
npm run mcp:lint
npm run mcp:test
npm run mcp:check:examples
npm exec --prefix tools/mcp-server -- playwright install --with-deps chromium firefox webkit
npm run mcp:test:browser
npm run mcp:test:cross-browser
```

For an existing Chromium installation set `SQ_UI_BROWSER` to its executable. Preview also accepts installed Firefox and WebKit engines. The browser suite validates an actual production application, exercises CRUD/forms/navigation and saves runtime, overflow, axe and screenshot results. Reports and screenshots are under `.sq-ui-mcp`; generated fixtures are under `examples/generated`.

The cross-browser suite uses Firefox and WebKit with Bulgarian labels, custom route IDs and RTL layout. Install them with `npm exec --prefix tools/mcp-server -- playwright install --with-deps firefox webkit` on a supported host. CI installs all three engines and their system dependencies.

Run repository checks after library changes: production library builds, package/style exports, typecheck, lint, tests and the demo build. CI runs the MCP checks and uploads UI reports as well.

## Scope and limits

The package delivers local stdio MCP. Remote HTTP hosting remains a separate extension. Data and login are demonstrations; production backend/authentication, charts and other external providers require explicit integration. Full application SSR is not supplied; ThemeService guards browser-only APIs. Automated axe checks supplement manual keyboard and assistive-technology checks.

The registry contains the source snapshot version bundled with this build. Every public export is indexed, including deprecated compatibility declarations and the Temporal secondary entry point. Component accessibility limits outside the generated admin flow should be checked against their actual APIs before extending their contracts.

Creating an npm tarball is local packaging. Publication and global client installation are separate release actions.

Run `node tools/mcp-server/test/package.mjs` to build a tarball, inspect its contents, install it in a clean temporary consumer and verify a real MCP connection outside the repository. The release archive is written under `.sq-ui-mcp/releases`. See [the validation record](validation.md) for observed results and environment limits.
