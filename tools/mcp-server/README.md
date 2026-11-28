# ng-sq-ui MCP

Local MCP server for source-backed ng-sq-ui documentation, runnable examples, complete themes and Angular admin interfaces. Node 24.15 or newer is required.

Build from this repository:

```sh
npm ci
npm ci --prefix tools/mcp-server
npm run build:libs
npm run mcp:build
node tools/mcp-server/build/cli.js doctor
```

Start the read-only documentation server:

```sh
node tools/mcp-server/build/cli.js
```

Start the build profile with access to this workspace:

```sh
node tools/mcp-server/build/cli.js --profile build --workspace .
```

Configure a client without replacing its other servers:

```sh
node tools/mcp-server/build/cli.js init --client cursor --directory . --workspace .
```

Supported client configuration formats are Cursor, VS Code, Claude Code, Claude Desktop, Windsurf, OpenCode and Codex. The directory option chooses where configuration is written; for desktop clients choose the actual configuration directory. Existing conflicting `sq-ui` entries are preserved and reported. Client configuration points directly to Node and the built CLI, keeping package-manager output out of the protocol stream.

Use `--library-version 3.0.2` to require the packaged snapshot and `--ttl 6` to select the registry reload interval in minutes. An unknown version produces `VERSION_UNAVAILABLE`. The server does not silently switch to a different API version. All documentation data is bundled; read-only use requires neither a network connection nor an Angular project.

The `skills` directory and portable `plugin.json` / `mcp.json` are included in the npm package. The portable plugin defaults to the documentation profile. Use client initialization with a workspace for mutation/build tools. No global plugin installation or npm publication is performed by building the package.

See [the workflow guide](../../docs/mcp/README.md) in the source repository for tool contracts, generation specs, validation and known limits.
