import ts from 'typescript';
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

const hash = value => createHash('sha256').update(value).digest('hex');

/** Follow real public exports, including aliases, inherited signals and secondary entries. */
export async function extractRegistry(root, examples) {
  const configFile = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
  const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, root);
  const entries = [];
  for (const name of (await readdir(path.join(root, 'projects'))).sort()) {
    const directory = path.join(root, 'projects', name);
    const pkg = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'));
    entries.push({ file: path.join(directory, 'src/index.ts'), package: pkg.name, version: pkg.version });
    if (name === 'ng-datetime-picker') entries.push({ file: path.join(directory, 'temporal/src/index.ts'), package: `${pkg.name}/temporal`, version: pkg.version });
  }
  const program = ts.createProgram(entries.map(entry => entry.file), { ...config.options, noEmit: true });
  const checker = program.getTypeChecker();
  const inputs = new Map();
  const declarations = new Map();
  const modules = [];
  const read = async file => {
    const value = await readFile(file, 'utf8');
    inputs.set(path.relative(root, file).replaceAll('\\', '/'), hash(value));
    return value;
  };
  const doc = symbol => ts.displayPartsToString(symbol.getDocumentationComment(checker));
  const typeText = node => checker.typeToString(checker.getTypeAtLocation(node), node, ts.TypeFormatFlags.NoTruncation);
  function membersOf(node, seen = new Set()) {
    if (!node || seen.has(node)) return [];
    seen.add(node);
    const inherited = (node.heritageClauses ?? []).filter(clause => clause.token === ts.SyntaxKind.ExtendsKeyword)
      .flatMap(clause => clause.types.flatMap(base => {
        let symbol = checker.getSymbolAtLocation(base.expression);
        if (symbol?.flags & ts.SymbolFlags.Alias) symbol = checker.getAliasedSymbol(symbol);
        return membersOf(symbol?.declarations?.[0], seen);
      }));
    const own = (node.members ?? []).flatMap(member => {
      if (!member.name || ts.isPrivateIdentifier(member.name) || member.modifiers?.some(modifier => [ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword].includes(modifier.kind))) return [];
      const name = member.name.getText();
      const init = member.initializer;
      let binding = 'member', alias = name, required = false;
      if (init && ts.isCallExpression(init)) {
        const expression = init.expression.getText().split('.');
        if (['input', 'model', 'output'].includes(expression[0])) {
          binding = expression[0];
          required = expression[1] === 'required';
          const options = init.arguments.find(ts.isObjectLiteralExpression);
          const aliasProp = options?.properties.find(prop => prop.name?.getText() === 'alias');
          if (aliasProp && ts.isPropertyAssignment(aliasProp) && ts.isStringLiteral(aliasProp.initializer)) alias = aliasProp.initializer.text;
        }
      }
      for (const decorator of ts.canHaveDecorators(member) ? ts.getDecorators(member) ?? [] : []) {
        if (!ts.isCallExpression(decorator.expression)) continue;
        const name = decorator.expression.expression.getText();
        if (name === 'Input' || name === 'Output') {
          binding = name.toLowerCase();
          const argument = decorator.expression.arguments[0];
          if (argument && ts.isStringLiteral(argument)) alias = argument.text;
        }
      }
      const symbol = checker.getSymbolAtLocation(member.name);
      return [{ name, alias, binding, required, type: typeText(member), initializer: init?.getText(), description: symbol ? doc(symbol) : '', inherited: false }];
    });
    return [...inherited.filter(base => !own.some(member => member.name === base.name)).map(base => ({ ...base, inherited: true })), ...own];
  }
  for (const entry of entries) {
    const source = program.getSourceFile(entry.file);
    if (!source) throw new Error(`Missing public entry point ${entry.file}`);
    await read(entry.file);
    const module = checker.getSymbolAtLocation(source);
    const exports = [];
    for (const exported of checker.getExportsOfModule(module)) {
      const symbol = exported.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(exported) : exported;
      const declaration = symbol.valueDeclaration ?? symbol.declarations?.[0];
      if (!declaration) throw new Error(`Unresolved export ${entry.package}:${exported.name}`);
      const id = `${path.relative(root, declaration.getSourceFile().fileName)}:${symbol.name}`.replaceAll('\\', '/');
      exports.push({ name: exported.name, declarationId: id });
      const existing = declarations.get(id);
      if (existing) { existing.imports.push({ package: entry.package, name: exported.name }); continue; }
      const sourceFile = declaration.getSourceFile();
      await read(sourceFile.fileName);
      const demo = examples.find(example => example.exportName === exported.name);
      const decorators = ts.canHaveDecorators(declaration) ? ts.getDecorators(declaration) ?? [] : [];
      let selector = demo?.selector, kind = ts.SyntaxKind[declaration.kind];
      const metadata = decorators.find(decorator => ts.isCallExpression(decorator.expression) && ['Component', 'Directive', 'Injectable'].includes(decorator.expression.expression.getText()));
      let template = '', styles = '';
      if (metadata && ts.isCallExpression(metadata.expression)) {
        const name = metadata.expression.expression.getText();
        kind = name.toLowerCase();
        const object = metadata.expression.arguments[0];
        if (object && ts.isObjectLiteralExpression(object)) for (const property of object.properties) {
          if (!ts.isPropertyAssignment(property)) continue;
          const key = property.name.getText();
          const value = property.initializer;
          if (key === 'selector' && ts.isStringLiteral(value)) selector = value.text;
          if (key === 'template' && ts.isStringLiteralLike(value)) template = value.text;
          if (key === 'templateUrl' && ts.isStringLiteral(value)) template = await read(path.resolve(path.dirname(sourceFile.fileName), value.text));
          if (key === 'styleUrls' && ts.isArrayLiteralExpression(value)) for (const url of value.elements) {
            if (ts.isStringLiteral(url)) styles += await read(path.resolve(path.dirname(sourceFile.fileName), url.text));
          }
        }
      }
      const members = membersOf(declaration);
      declarations.set(id, {
        declarationId: id, id: demo?.id ?? exported.name, name: exported.name, kind, selector,
        description: demo?.description ?? doc(symbol), category: demo?.category ?? 'Public API',
        imports: [{ package: entry.package, name: exported.name }],
        members, inputs: members.filter(member => ['input', 'model'].includes(member.binding)),
        outputs: [...members.filter(member => member.binding === 'output'), ...members.filter(member => member.binding === 'model').map(member => ({ ...member, alias: `${member.alias}Change`, generated: true }))],
        slots: [...template.matchAll(/<ng-content(?:\s+select="([^"]*)")?\s*[^>]*>/g)].map(match => match[1] ?? '*'),
        cssProperties: [...new Set([...styles.matchAll(/--sq-[\w-]+/g)].map(match => match[0]))],
        signature: ts.isClassDeclaration(declaration) ? members.map(member => `${member.name}: ${member.type}`).join('\n') : declaration.getText().slice(0, 16000),
        deprecated: symbol.getJsDocTags().find(tag => tag.name === 'deprecated')?.text?.map(part => part.text).join(''),
        source: path.relative(root, sourceFile.fileName).replaceAll('\\', '/'),
        supportStatus: 'native', variants: demo?.variants ?? [],
        limitations: ({
          'datetime-picker': ['Calendar grid keyboard navigation is partial; check the requested interaction before claiming complete keyboard accessibility.'],
          typeahead: ['Keyboard option navigation/listbox behavior requires separate validation.'],
          datatable: ['Custom bodies own their sorting and paging. Mobile cards hide built-in header sort controls; provide a separate sort UI.']
        })[demo?.id] ?? []
      });
    }
    modules.push({ package: entry.package, version: entry.version, exports });
  }
  const require = createRequire(path.join(root, 'package.json'));
  const sass = require('sass');
  const tokenFile = path.join(root, 'projects/ng-sq-common/src/lib/styles/_token-values.scss');
  await read(tokenFile);
  const css = sass.compileString('@use "token-values" as sq; .tokens { @each $key, $value in sq.$tokens { --#{$key}: #{$value}; } }', { loadPaths: [path.dirname(tokenFile)] }).css;
  const tokens = [...css.matchAll(/--([\w-]+): ([^;]+);/g)].map(match => ({ name: match[1], cssProperty: `--sq-${match[1]}`, value: match[2].trim(), category: match[1].split('-')[0] }));
  const documents = [];
  for (const filename of ['README.md', 'docs/installation.md', 'docs/styling.md', 'docs/examples.md', 'docs/typography.md', 'docs/theme-colors.md', 'docs/datatable-module.md', 'docs/modal-module.md']) {
    documents.push({ id: filename === 'README.md' ? 'overview' : path.basename(filename, '.md'), title: path.basename(filename, '.md'), markdown: await read(path.join(root, filename)), source: filename });
  }
  await read(path.join(root, 'tools/ui-registry/catalog.ts'));
  await read(path.join(root, 'tools/ui-registry/example-code.ts'));
  // Include shared styles and private implementation dependencies in provenance too.
  async function hashImplementation(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory() && !['node_modules', 'dist'].includes(entry.name)) await hashImplementation(file);
      else if (entry.isFile() && /\.(?:ts|html|scss|json)$/.test(entry.name) && !entry.name.endsWith('.spec.ts')) await read(file);
    }
  }
  await hashImplementation(path.join(root, 'projects'));
  let commit = 'unknown';
  try { commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(); } catch { /* Source archives have no Git metadata. */ }
  const snapshot = { schemaVersion: 1, version: modules.find(module => module.package === '@sq-ui/ng-sq-ui').version, angularMajor: 22, commit, sourceDigest: hash(JSON.stringify([...inputs].sort())), modules, declarations: [...declarations.values()].sort((a, b) => a.id.localeCompare(b.id)), tokens, documents, examples, sourceHashes: Object.fromEntries([...inputs].sort()) };
  return { digest: hash(JSON.stringify(snapshot)), snapshot };
}

export async function writeRegistry(root, examples, destination) {
  const registry = await extractRegistry(root, examples);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, JSON.stringify(registry, null, 2) + '\n');
  return registry;
}
