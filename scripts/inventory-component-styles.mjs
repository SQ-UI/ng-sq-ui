/** Snapshot component contracts and stylesheet dependencies without modifying implementation. */
import ts from 'typescript';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const files = execFileSync('rg', ['--files', 'projects', '-g', '*component.ts', '-g', '!*.spec.ts'], { encoding: 'utf8' })
  .trim().split(/\r?\n/).map(file => file.replaceAll('\\', '/')).sort();
const components = [];
for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const signals = [];
  function visit(node) {
    if (ts.isPropertyDeclaration(node) && node.initializer && ts.isCallExpression(node.initializer)) {
      const call = node.initializer;
      const factory = call.expression.getText(source);
      if (/^(input(?:\.required)?|model|output|contentChild|contentChildren)$/.test(factory)) {
        signals.push({ name: node.name.getText(source), kind: factory, declaration: node.getText(source), line: source.getLineAndCharacterOfPosition(node.getStart()).line + 1 });
      }
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  const selector = text.match(/selector:\s*'([^']+)'/)?.[1];
  if (!selector) continue; // Deprecated non-component base class.
  const stem = file.slice(0, -3);
  const template = `${stem}.html`;
  const stylesheet = `${stem}.scss`;
  const html = readFileSync(template, 'utf8');
  const scss = readFileSync(stylesheet, 'utf8');
  components.push({
    selector, file, template, stylesheet,
    encapsulation: text.match(/encapsulation:\s*([^,\r\n]+)/)?.[1] || 'default',
    signals,
    projectedSlots: [...html.matchAll(/<ng-content(?:\s+select="([^"]+)")?/g)].map(match => match[1] || '*'),
    templateContexts: [...html.matchAll(/\[ngTemplateOutletContext\]="([^"]+)"/g)].map(match => match[1]),
    eventBindings: [...new Set([...html.matchAll(/\(([^)]+)\)="/g)].map(match => match[1]))],
    styleImports: [...scss.matchAll(/@use\s+['"]([^'"]+)/g)].map(match => match[1]),
    mediaQueries: [...scss.matchAll(/@media[^\{]+/g)].map(match => match[0].trim()),
  });
}
const output = 'docs/style-migration/source-inventory.json';
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify({
  sourceCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  capturedDate: '2026-11-03',
  method: 'TypeScript AST for signal declarations; source inspection for selectors, template slots/events, and stylesheet dependencies. Internal template queries are not public inputs.',
  components,
}, null, 2)}\n`);
console.log(`Inventoried ${components.length} Angular components in ${output}`);
