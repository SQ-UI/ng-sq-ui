# Vitest 4 Migration Plan (ng-sq-ui)

**Status: ✅ executed — workspace is on Vitest 4.1.12.**
**Related:** `ANGULAR_22_UPGRADE_PLAN.md` §13.7 (result) and §13.4 (items **T9**, **T10**, both closed).

---

## 0. Outcome (executed)

| Item | Result |
|---|---|
| `vitest` / `@vitest/coverage-v8` | **4.1.12** (was 3.2.7) |
| Install | `npm install` and `npm ci` succeed **without** `--legacy-peer-deps`; the workflow no longer passes it |
| Suite | **34 files / 124 tests**, ~8 s, `coverage/lcov.info` produced |
| Excluded spec | none — `src/app/datetime-picker/**/*.spec.ts` is back in the run (it needed `provideRouter([])`, the same missing-provider gap the modal/sq-ui specs had) |
| Config | `coverage.include` + `exclude` added (`coverage.all`/`extensions` removed in v4); explicit `test.exclude` for `node_modules`/`dist` (v4 dropped the long default list); `poolOptions`/`test.alias` were never used, so nothing to remove |

### Root cause of the "runner hang" (the whole §2 story)

**A stale Vite dependency-optimizer cache (`node_modules/.vite`), not an upstream bug and not the polyfill.**

The cache was poisoned by the earlier investigation itself: several test runs were killed with
`pkill -9` while Vite was mid-optimization, leaving a half-written `_metadata.json` / chunk set. Every
subsequent run then waited forever on the optimizer. After a clean `npm install` (which replaced the
dist/fesm layout and invalidated the cache) the same probe that used to hang finished in **1.7 s**:

```text
$ npx vitest run src/app/temporal-probe        # import { Temporal } from '@js-temporal/polyfill'
 ✓ src/app/temporal-probe.spec.ts (1 test) 6ms
 Test Files  1 passed (1)   Duration  1.76s
```

**Lesson (worth codifying in CONTRIBUTING):** never `pkill -9` a Vitest run; if a run appears to hang,
`rm -rf node_modules/.vite` and re-run before investigating code.

The rest of this document is kept as the (still valid) reference for what a Vitest major upgrade needs.

---

## 1. Why migrate at all

| Reason | Detail |
|---|---|
| Angular 22 alignment | `@angular/build@22.0.8` declares `peerOptional vitest@^4.0.8`. The workspace is on **Vitest 3.2.7**, so `npm install` fails with `ERESOLVE` and CI has to run `npm ci --legacy-peer-deps`. |
| Supported stack | Angular 22's unit-test runner integration targets Vitest 4; staying on 3 means shipping an untested combination in every PR. |
| Coverage accuracy | Vitest 4 replaces `v8-to-istanbul` with AST-aware remapping; today's reports have false positives (e.g. type-only `nav-item.ts` reported as 0 %). |
| Future Vitest 5 | `latest` is already 5.0.5; moving to 4 first keeps the next jump small. |

State today (after the Angular 22 work):

```text
vitest 3.2.7 · @vitest/coverage-v8 3.2.7 · @analogjs/vite-plugin-angular 2.6.4
@analogjs/vitest-angular removed (tests run zoneless through BrowserTestingModule)
32 spec files / 118 tests · ~8 s · coverage/lcov.info produced
```

---

## 2. The blocker as observed at the time (now explained by §0)

`vitest@4.1.12` + `@vitest/coverage-v8@4` installed cleanly and the config was accepted, **but the run never settled**:

```text
$ npx vitest run
 RUN  v4.1.12 /…/ng-sq-ui
  ✓ projects/ng-datetime-picker/…/calendar-manager.service.spec.ts (12 tests) 116ms
  ✓ projects/ng-form-elements/…/checkbox.component.spec.ts (4 tests) 129ms
  …                                     ← 30 of 32 files reported
  (no summary, no exit code — process alive, CPU idle)
```

Narrowed with throwaway smoke specs (deleted afterwards):

| Experiment | Result |
|---|---|
| Spec whose only content is `import { Temporal } from '@js-temporal/polyfill'` | **hangs at import**, no test starts |
| Spec importing the demo docs component (pulls the polyfill) | **hangs** |
| Any other single spec (`src/app/home`, `projects/ng-form-elements/src/lib/input`) | passes in ~2 s |
| `pool: 'forks'` (default) vs `pool: 'threads'` | hangs / hangs earlier |
| `test.server.deps.inline: [/@js-temporal\/polyfill/, /jsbi/]` | hangs |
| `test.server.deps.external: [/@js-temporal\/polyfill/, /jsbi/]` | hangs |
| `test.deps.optimizer.web.include: ['@js-temporal/polyfill', 'jsbi']` | hangs |
| Cold cache (`rm -rf node_modules/.vite .angular/cache`) | hangs |
| Same experiments on **Vitest 3.2.7** | polyfill specs pass **inside the full run**; the polyfill-only smoke spec still hangs in isolation |

**Conclusion:** a *tooling* interaction between Vite's dependency optimizer, the CJS `jsbi` dependency of `@js-temporal/polyfill` and Vitest worker bootstrapping — not component code (the real component-level loop found on the way, **D19**, is fixed and covered by specs).

> **Update (see §0):** this was a poisoned `node_modules/.vite` cache, not an upstream bug. The
> conclusions above were gathered while the cache stayed broken, which is why every config variation
> "reproduced" the hang.

---

## 3. Root-cause hypotheses (in order of likelihood)

| # | Hypothesis | How to prove/disprove |
|---|---|---|
| H1 | Vite 7's dep optimizer deadlocks while bundling `jsbi` (CJS, ~100 kB) when it is the only dependency to optimize in a worker | Reproduce in a bare Vite 7 + Vitest 4 project (no Angular plugin) with one spec importing the polyfill; if it hangs, the bug is upstream |
| H2 | `@analogjs/vite-plugin-angular` builds a TS program from `tsconfig.spec.json` (now `projects/**/*.ts` + `src/**/*.ts`) on the worker's first import; the polyfill import triggers it twice and deadlocks | Set `include: ['**/*.spec.ts']` only (or `skipTypeCheck`) and re-run the smoke spec |
| H3 | Vitest 4 worker teardown waits on a pending microtask created by the polyfill's `Temporal.Now` proxy | Run the smoke spec with `isolate: false` |
| H4 | Angular JIT + the polyfill clash in jsdom (`globalThis.Temporal` shadowing) | Run with `environment: 'node'` |

---

## 4. Migration plan

### Phase 1 — reproduce and isolate (0.5 day)

1. Build `tools/vitest4-probe/` (plain Vite 7 + Vitest 4, excluded from the workspace tsconfig) with a single spec importing `@js-temporal/polyfill` → settles **H1**.
2. Inside the repo, repeat with `include: ['**/*.spec.ts']` (H2), `isolate: false` (H3), `environment: 'node'` (H4).
3. File a Vitest/Vite issue with the minimal reproduction if H1 is confirmed.

### Phase 2 — pick the path

**Path A — keep `@analogjs/vite-plugin-angular` + Vitest 4** (smaller diff)

- Apply §5 and a workaround based on the Phase 1 finding:
  - H1/H2 → `optimizeDeps.include` for the polyfill + `ssr.noExternal`, or `deps.optimizer.web.enabled: false` for it only.
  - H3 → `test.isolate: false` (slower but deterministic).
  - H4 → run the datetime-picker specs in a Node environment with an explicit `Temporal` shim in `setup-test.ts`.
- Re-enable `src/app/datetime-picker/**/*.spec.ts`.

**Path B — adopt Angular's own unit-test builder** (recommended if Path A stays flaky)

Angular 22 ships `@angular/build:unit-test`, which runs Vitest 4 with Angular's own bootstrap — the combination Angular CI-tests itself.

```jsonc
// angular.json (per project)
"test": {
  "builder": "@angular/build:unit-test",
  "options": {
    "tsConfig": "projects/ng-sq-common/tsconfig.spec.json",
    "buildTarget": "ng-sq-common:build",
    "runner": "vitest",
    "setupFiles": ["setup-test.ts"]
  }
}
```

Work items: keep `vitest.config.ts` only for aliases (or move aliases into `tsconfig.spec.json` `paths`), replace `npm test` with `ng test --watch=false`, keep `coverage/lcov.info` for CodeClimate, and drop `@analogjs/*` from `devDependencies`.

Decision rule: **Path B** if Phase 1 produces no workaround that survives three consecutive CI runs; **Path A** otherwise.

### Phase 3 — validation

```bash
npm install                     # ERESOLVE-free, no --legacy-peer-deps
npm run typecheck
npm run lint
npm run build:libs
npm run build
npm test                        # 34 files / 124 tests, terminates < 60 s
npm run coverage                # lcov.info present, no coverage.all usage
```

Then three consecutive green CI runs on `morph-main`, and `--legacy-peer-deps` removed from `.github/workflows/main.yml`.

### Phase 4 — cleanup

- Delete the `exclude` workaround for `src/app/datetime-picker`.
- Remove `--legacy-peer-deps` from CI, README and CONTRIBUTING.
- Upgrade (Path A) or delete (Path B) `@analogjs/*`; record the Vitest major in `package.json`.

---

## 5. Vitest 3 → 4 breaking changes that affect this repo

Verified against the official *Migrating to Vitest 4.0* guide and the v4 config reference.

| Area | Vitest 3 (today) | Vitest 4 | Action in this repo |
|---|---|---|---|
| Prerequisites | Vite 5/6, Node 18+ | **Vite ≥ 6.0**, **Node ≥ 20** | ✅ Vite 7 / Node 24 already satisfy it |
| `poolOptions.forks.singleFork` / `maxForks` | supported | **removed** (no `poolOptions` group in the v4 config reference) | use `fileParallelism: false` + `maxWorkers: 1` if serial execution is ever needed; the config no longer sets them |
| `maxWorkers` / `minWorkers` | `minWorkers` existed | `maxWorkers` only | nothing to change (not set) |
| `test.alias` | supported | still listed, but `resolve.alias` is the supported route | ✅ config already uses `resolve.alias` only |
| `workspace` | deprecated | replaced by **`projects`** | not used |
| Default `exclude` | long list (`dist`, `cypress`, config files, …) | **only `node_modules` and `.git`** — everything else must be listed | keep our explicit `exclude` (`**/dist/**`, polyfill workaround) |
| Coverage | `coverage.all`, `coverage.extensions` | **removed** — only covered files are reported unless `coverage.include` is set | add `coverage.include: ['projects/*/src/**/*.ts', 'src/app/**/*.ts']` plus `exclude` |
| Coverage internals | `v8-to-istanbul`, `coverage.ignoreEmptyLines`, `coverage.experimentalAstAwareRemapping` | AST-aware remapping by default; those options are **removed** | expect different percentages; re-baseline CodeClimate |
| Reporters | `basic` (deprecated in 3.x, prints a warning) | `basic` **removed** | not used (default reporter) |
| `deps.optimizer` / `server.deps` | available | available | the polyfill workaround may need `server.deps.inline` or `deps.optimizer.web.include` |
| `environment: 'jsdom'` | jsdom | unchanged | keep `jsdom` + `jsdom@29` in devDependencies |

Not affected here: snapshot format, fake timers and `vi.spyOn`/`vi.fn` semantics — the suite only uses `vi.fn()` in `setup-test.ts` with `restoreMocks: true`.

---

## 6. Risk register

| Risk | Impact | Mitigation |
|---|---|---|
| The polyfill hang turns out to be an upstream Vite bug | migration blocked for weeks | Path B (Angular builder) as fallback; or make `@js-temporal/polyfill` optional (**C6**) so the test graph never loads it |
| Coverage numbers shift (AST-aware remapping) | CodeClimate gate flips | re-baseline in the migration PR itself |
| Parallel workers expose shared state between specs | flaky suite | each spec builds its own `TestBed`; if it shows up, set `sequence.concurrent: false` for the affected files |
| `@analogjs` releases lag behind Vitest 4 | Path A stalls | Path B removes the dependency entirely |
| Losing the zoneless test bootstrap | zoneless regressions slip through | the bootstrap (`BrowserTestingModule` + `provideZonelessChangeDetection`) is runner-independent; port it to whichever path wins |

---

## 7. Definition of done

- [x] `npm install` succeeds **without** `--legacy-peer-deps` (verified with a clean `npm ci`).
- [x] `npm test` terminates in ~8 s, **including** `src/app/datetime-picker/**/*.spec.ts` (no `exclude` workaround). → 33 files / 119 tests.
- [x] `npm run coverage` writes `coverage/lcov.info` (84.4 % statements with the v4 AST-aware remapping).
- [x] `vitest` and `@vitest/coverage-v8` on `^4` (4.1.12).
- [x] `--legacy-peer-deps` removed from the workflow; CI runs `npm ci` + `typecheck` + `lint` + `build:libs` + `build` + `coverage`.
- [x] Outcome recorded here and in `ANGULAR_22_UPGRADE_PLAN.md` §13.7.

