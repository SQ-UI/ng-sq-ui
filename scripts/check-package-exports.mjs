#!/usr/bin/env node
/**
 * Post-build guard for the published package layout.
 *
 * ng-packagr rewrites `package.json` for every library it builds: it derives the `exports` map, the
 * `module`/`typings` entry points and the `types` paths of every secondary entry point. A dependency
 * bump (or a renamed entry point) can silently change that shape, and the breakage only shows up in a
 * consumer's build as `Cannot find module '@sq-ui/<pkg>/<subpath>'`.
 *
 * This script compares the built `dist/**` packages with the sources in `projects/**` and fails when
 *   - a library has no build output (i.e. `npm run build:libs` was not run),
 *   - the published name/version drifted from the source `package.json`,
 *   - a secondary entry point declared in the sources is not exported by the built package,
 *   - the built package exports a subpath that no source entry point declares,
 *   - an `exports` target, `module`, `typings` or copied asset does not exist on disk,
 *   - a peer dependency of the source package is missing from the published manifest.
 *
 * Usage: `npm run check:exports` (requires a prior `npm run build:libs`).
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const projectsDir = join(repoRoot, 'projects');
const distRoot = join(repoRoot, 'dist');
const failures = [];
const reports = [];

const fail = (lib, message) => failures.push(`${lib}: ${message}`);
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));
const isDirectory = (path) => existsSync(path) && statSync(path).isDirectory();

/** Secondary entry points are the sibling directories of a library's primary `ng-package.json`. */
const readSecondaryEntryPoints = (libDir) => readdirSync(libDir)
  .filter((entry) => !['node_modules', 'src', 'dist'].includes(entry))
  .filter((entry) => isDirectory(join(libDir, entry)))
  .filter((entry) => existsSync(join(libDir, entry, 'ng-package.json')));

/** Every target string inside an `exports` value, e.g. `./fesm2022/x.mjs`. */
function readExportTargets(exportValue) {
  if (typeof exportValue === 'string') {
    return [exportValue];
  }
  if (!exportValue || typeof exportValue !== 'object') {
    return [];
  }
  return Object.values(exportValue).flatMap(readExportTargets);
}

function assertFileExists(lib, distDir, target, context) {
  const resolved = resolve(distDir, target);

  if (!resolved.startsWith(distDir)) {
    return fail(lib, `${context} points outside the package (${target})`);
  }

  if (!existsSync(resolved)) {
    fail(lib, `${context} target is missing: ${target}`);
  }
}

/** ng-packagr copies `assets` (glob/input/output); the published styles must be there. */
function checkAssets(lib, libDir, distDir, ngPackage) {
  for (const asset of ngPackage.assets ?? []) {
    const inputDir = resolve(libDir, asset.input ?? '.');
    const outputDir = resolve(distDir, asset.output ?? '.');

    if (!isDirectory(outputDir)) {
      fail(lib, `asset output directory is missing: ${relative(repoRoot, outputDir)}`);
      continue;
    }

    const extension = asset.glob?.startsWith('*.') ? asset.glob.slice(1) : undefined;
    const sources = existsSync(inputDir)
      ? readdirSync(inputDir).filter((file) => (extension ? file.endsWith(extension) : file === asset.glob))
      : [];

    if (sources.length === 0) {
      fail(lib, `asset glob "${asset.glob}" matches nothing in ${relative(repoRoot, inputDir)}`);
      continue;
    }

    for (const source of sources) {
      if (!existsSync(join(outputDir, source))) {
        fail(lib, `asset was not published: ${relative(repoRoot, join(outputDir, source))}`);
      }
    }
  }
}

const libraries = readdirSync(projectsDir)
  .filter((entry) => existsSync(join(projectsDir, entry, 'package.json')))
  .sort();

for (const lib of libraries) {
  const libDir = join(projectsDir, lib);
  const sourcePackage = readJson(join(libDir, 'package.json'));
  const distDir = join(distRoot, lib);
  const distPackagePath = join(distDir, 'package.json');
  const notes = [];

  if (!existsSync(distPackagePath)) {
    fail(lib, 'no build output — run `npm run build:libs` first');
    continue;
  }

  const distPackage = readJson(distPackagePath);

  if (distPackage.name !== sourcePackage.name) {
    fail(lib, `published name "${distPackage.name}" !== source name "${sourcePackage.name}"`);
  }

  if (distPackage.version !== sourcePackage.version) {
    fail(lib, `published version "${distPackage.version}" !== source version "${sourcePackage.version}"`);
  }

  for (const field of ['module', 'typings']) {
    if (!distPackage[field]) {
      fail(lib, `"${field}" is missing from the built package.json`);
      continue;
    }
    assertFileExists(lib, distDir, distPackage[field], `"${field}"`);
  }

  const exportsMap = distPackage.exports ?? {};

  if (!exportsMap['./package.json']) {
    fail(lib, 'exports map has no "./package.json" entry');
  }

  if (!exportsMap['.']) {
    fail(lib, 'exports map has no "." entry');
  }

  // Secondary entry points: whatever the sources declare must be exported, and nothing else.
  const secondaryEntryPoints = readSecondaryEntryPoints(libDir);
  const expectedSubpaths = new Set(secondaryEntryPoints.map((entry) => `./${entry}`));

  for (const subpath of expectedSubpaths) {
    if (!exportsMap[subpath]) {
      fail(lib, `secondary entry point "${subpath}" is not exported by the built package`);
    }
  }

  for (const subpath of Object.keys(exportsMap)) {
    if (subpath === '.' || subpath === './package.json') {
      continue;
    }
    if (!expectedSubpaths.has(subpath)) {
      fail(lib, `built package exports "${subpath}" but no source entry point declares it`);
    }
  }

  for (const [subpath, exportValue] of Object.entries(exportsMap)) {
    if (subpath === './package.json') {
      continue;
    }
    for (const target of readExportTargets(exportValue)) {
      assertFileExists(lib, distDir, target, `exports["${subpath}"]`);
    }
  }

  // ng-packagr copies the peer dependencies verbatim; a missing one breaks `npm i` resolution.
  for (const peer of Object.keys(sourcePackage.peerDependencies ?? {})) {
    if (!distPackage.peerDependencies?.[peer]) {
      fail(lib, `peer dependency "${peer}" is missing from the built package.json`);
    }
  }

  const ngPackagePath = join(libDir, 'ng-package.json');
  if (existsSync(ngPackagePath)) {
    checkAssets(lib, libDir, distDir, readJson(ngPackagePath));
  }

  notes.push(`exports: ${Object.keys(exportsMap).join(', ')}`);
  if (secondaryEntryPoints.length > 0) {
    notes.push(`secondary entry points: ${secondaryEntryPoints.join(', ')}`);
  }
  reports.push(`${distPackage.name}@${distPackage.version} — ${notes.join(' | ')}`);
}

if (failures.length > 0) {
  console.error('\nPackage layout check failed:\n');
  for (const failure of failures) {
    console.error(`  ✖ ${failure}`);
  }
  console.error('');
  process.exit(1);
}

console.log('\nPackage layout check passed:');
for (const report of reports) {
  console.log(`  ✔ ${report}`);
}
console.log('');
