/** Verify published Sass in an isolated consumer containing no repository sources.
 * Requires a prior library build. No dependency installation or network access.
 */
import assert from 'node:assert/strict';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createRequire } from 'node:module';

// Sass is an explicit ng-packagr dependency; resolve it there even if npm nests it.
const require = createRequire(import.meta.url);
const sass = createRequire(require.resolve('ng-packagr/package.json'))('sass');

const temporaryRoot = resolve('tmp');
mkdirSync(temporaryRoot, { recursive: true });
const consumer = mkdtempSync(join(temporaryRoot, 'sq-style-consumer-'));
const scopedPackages = join(consumer, 'node_modules', '@sq-ui');
mkdirSync(scopedPackages, { recursive: true });
writeFileSync(join(consumer, 'package.json'), '{"name":"sq-style-consumer","private":true}');
for (const name of ['ng-sq-common', 'ng-form-elements']) {
  cpSync(resolve('dist', name), join(scopedPackages, name), { recursive: true });
}
const options = { importers: [new sass.NodePackageImporter(consumer)] };
const compile = source => sass.compileString(source, options).css;

const css = compile(`
  @use 'pkg:@sq-ui/ng-sq-common/styles/tokens' as sq with (
    $overrides: ('color-brand': #123456)
  );
  @use 'pkg:@sq-ui/ng-sq-common/sq-ui-theme';
  @use 'pkg:@sq-ui/ng-form-elements/styles/form-elements';
  @use 'pkg:@sq-ui/ng-sq-common/styles/colors' as legacy;
  @use 'pkg:@sq-ui/ng-sq-common/styles/typography' as type;
  .consumer-probe {
    color: legacy.$primary-theme-color;
    background: sq.value('color-brand');
    @include type.field-small;
  }
  .consumer-theme { @include sq.custom-properties; }
`);
assert.match(css, /\.sq \.input-field\s*\{/);
assert.match(css, /var\(--sq-color-brand, #123456\)/);
assert.match(css, /color: #123456;/);
assert.match(css, /font-size: var\(--sq-font-size-field-small, 12px\)/);
assert.match(css, /:where\(\.sq\) \*/);
assert.doesNotMatch(css, /^\.input-field\s*\{|^\.disabled\s*\{|^\*\s*\{/m);
assert.match(css, /\.consumer-theme\s*\{\s*--sq-color-brand: #123456;/);
assert.doesNotMatch(compile(`@use 'pkg:@sq-ui/ng-sq-common/sq-ui-theme';`), /--sq-color-brand\s*:/, 'Default theme must not shadow inherited overrides.');

// Every declared Sass condition must work through Node's package resolution.
let sassExports = 0;
for (const name of ['ng-sq-common', 'ng-form-elements']) {
  const root = join(scopedPackages, name);
  const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  for (const [subpath, conditions] of Object.entries(pkg.exports)) {
    if (!conditions.sass) continue;
    compile(`@use 'pkg:${pkg.name}${subpath.slice(1)}';`);
    sassExports++;
  }
  for (const dir of [root, join(root, 'styles')]) {
    for (const file of readdirSync(dir).filter(file => file.endsWith('.scss'))) {
      assert.doesNotMatch(readFileSync(join(dir, file), 'utf8'), /src\/lib|projects\//, 'Published Sass cannot depend on repository sources.');
    }
  }
}

const legacy = compile(`
  @use 'pkg:@sq-ui/ng-sq-common/styles/colors' as legacy with ($primary-theme-color: #444444);
  .legacy { color: legacy.$base-form-element-color; background: legacy.$progress-line-color; }
`);
assert.match(legacy, /color: #444444;/);
assert.match(legacy, /background: #444444;/);
assert.throws(() => compile(`@use 'pkg:@sq-ui/ng-sq-common/styles/tokens' as sq; .bad { color: sq.value('misspelled-token'); }`), /Unknown SQ-UI token/);

writeFileSync(join(consumer, 'consumer.css'), css);
console.log(`Published Sass checks passed: ${sassExports} exports, isolated imports, shared configuration, legacy aliases, scoped reset/forms, unknown-token validation.`);
