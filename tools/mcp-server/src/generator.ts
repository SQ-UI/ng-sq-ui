import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import ts from 'typescript';
import { exampleCode } from '../../ui-registry/example-code';
import { uiSpecSchema, type UiSpec } from './schema';
import { Registry } from './registry';
import { UiError } from './errors';
import { createTheme, type Theme } from './theme';
import { Workspace, type Artifact } from './workspace';

export const blueprints = [
  { id: 'admin-basic', modes: ['application'], supportStatus: 'composition', pages: ['dashboard-summary', 'crud-list', 'settings-form', 'login'] },
  { id: 'dashboard-summary', modes: ['page'], supportStatus: 'composition' },
  { id: 'crud-list', modes: ['page'], supportStatus: 'composition', features: ['search', 'filter', 'sort', 'paginate', 'edit', 'delete'] },
  { id: 'settings-form', modes: ['page'], supportStatus: 'composition' },
  { id: 'login', modes: ['page'], supportStatus: 'composition', dataProvider: 'mock' }
];

const english = {
  skip: 'Skip to content', header: 'Workspace header', theme: 'Theme', light: 'Light', dark: 'Dark', system: 'System', menu: 'Menu', navigation: 'Main navigation', demo: 'Demo data', overview: 'Overview', dashboard: 'Dashboard', welcome: 'A clear view of your workspace.', summary: 'Workspace summary', users: 'Users', totalUsers: 'Total workspace members', active: 'Active', inactive: 'Inactive', activeUsers: 'Active members', workspace: 'Workspace', activity: 'Recent activity', settings: 'Settings', settingsHelp: 'Manage workspace preferences.', name: 'Name', email: 'Email', required: 'This field is required.', validEmail: 'Enter a name and a valid email address.', notifications: 'Send email notifications', save: 'Save changes', saved: 'Changes saved.', login: 'Demo access', demoAccess: 'This example uses local demo data. Enter a name and email to continue.', continue: 'Continue', notFound: 'The requested page or user was not found.', back: 'Go back', usersHelp: 'Find, review and manage workspace members.', addUser: 'Add user', search: 'Search users', status: 'Status', all: 'All statuses', sort: 'Sort by name', ascending: 'A to Z', descending: 'Z to A', reload: 'Reload', simulateError: 'Show error state', deleted: 'User deleted.', loading: 'Loading users…', loadError: 'Users could not be loaded.', retry: 'Try again', results: 'results', actions: 'Actions', edit: 'Edit', delete: 'Delete', empty: 'No users found', emptyHelp: 'Try another search or filter.', pagination: 'User pages', deleteConfirm: 'Delete user?', deleteHelp: 'Remove this user from the demo workspace?', cancel: 'Cancel', confirm: 'Confirm deletion', editUser: 'Edit user', userHelp: 'Changes are shared with the list and dashboard.'
};
const bulgarian: typeof english = {
  skip: 'Към съдържанието', header: 'Заглавна навигация', theme: 'Тема', light: 'Светла', dark: 'Тъмна', system: 'Системна', menu: 'Меню', navigation: 'Основна навигация', demo: 'Примерни данни', overview: 'Общ преглед', dashboard: 'Табло', welcome: 'Общ поглед към работното пространство.', summary: 'Обобщение', users: 'Потребители', totalUsers: 'Всички потребители', active: 'Активни', inactive: 'Неактивни', activeUsers: 'Активни потребители', workspace: 'Работно пространство', activity: 'Последна активност', settings: 'Настройки', settingsHelp: 'Управление на предпочитанията.', name: 'Име', email: 'Имейл', required: 'Полето е задължително.', validEmail: 'Въведете име и валиден имейл.', notifications: 'Известия по имейл', save: 'Запази промените', saved: 'Промените са запазени.', login: 'Демонстрационен достъп', demoAccess: 'Примерът използва локални данни. Въведете име и имейл, за да продължите.', continue: 'Продължи', notFound: 'Страницата или потребителят не е намерен.', back: 'Назад', usersHelp: 'Търсене, преглед и управление на потребители.', addUser: 'Добави потребител', search: 'Търси потребители', status: 'Състояние', all: 'Всички състояния', sort: 'Подреди по име', ascending: 'А до Я', descending: 'Я до А', reload: 'Презареди', simulateError: 'Покажи грешка', deleted: 'Потребителят е изтрит.', loading: 'Зареждане…', loadError: 'Потребителите не могат да бъдат заредени.', retry: 'Опитай отново', results: 'резултата', actions: 'Действия', edit: 'Редактирай', delete: 'Изтрий', empty: 'Няма намерени потребители', emptyHelp: 'Променете търсенето или филтъра.', pagination: 'Страници с потребители', deleteConfirm: 'Изтриване на потребител?', deleteHelp: 'Да се премахне ли този потребител?', cancel: 'Отказ', confirm: 'Потвърди изтриването', editUser: 'Редакция на потребител', userHelp: 'Промените се виждат и в списъка, и в таблото.'
};

export function fullExample(demo: Parameters<typeof exampleCode>[0], variant: Parameters<typeof exampleCode>[1]) {
  const code = exampleCode(demo, variant);
  const imports = code.setup.split('\n').filter(line => line.startsWith('import '));
  const components = imports.filter(line => line.includes('@sq-ui/')).flatMap(line => line.slice(line.indexOf('{') + 1, line.indexOf('}')).split(',').map(item => item.trim()).filter(item => item && !item.startsWith('type ')));
  const body = code.setup.split('\n').filter(line => !line.startsWith('import ') && !line.startsWith('// Add ')).join('\n');
  return { typescript: `import { Component, ChangeDetectionStrategy } from '@angular/core';\n${imports.join('\n')}\n@Component({ selector: 'app-example', standalone: true, imports: [${components.join(', ')}], templateUrl: './example.component.html', changeDetection: ChangeDetectionStrategy.OnPush })\nexport class ExampleComponent {\n${body}\n}\n`, html: code.template };
}

function pagesFor(spec: UiSpec) {
  const text = spec.locale === 'bg-BG' ? bulgarian : english;
  const defaults = spec.mode === 'example' ? [{ id: 'example', recipe: 'example' }] : spec.mode === 'page' ? [{ id: spec.name, recipe: spec.blueprint }] : [
    { id: 'dashboard', recipe: 'dashboard-summary' }, { id: 'users', recipe: 'crud-list' }, { id: 'settings', recipe: 'settings-form' }, { id: 'login', recipe: 'login' }
  ];
  const selected: { id: string; recipe: string; features?: string[] }[] = spec.pages ?? defaults;
  return selected.map(page => ({ ...page, label: ({ 'dashboard-summary': text.dashboard, 'crud-list': text.users, 'settings-form': text.settings, login: text.login } as Record<string, string>)[page.recipe] ?? spec.title, features: page.features ?? ['search', 'filter', 'sort', 'paginate', 'edit', 'delete'] }));
}
function configSource(spec: UiSpec) {
  return `export interface UiConfiguration { title: string; locale: 'en-US' | 'bg-BG'; basePath: string; direction: 'ltr' | 'rtl'; themeModes: ('light' | 'dark' | 'system')[]; pages: { id: string; recipe: string; label: string; features: string[] }[] }\nexport const uiConfig: UiConfiguration = ${JSON.stringify({ title: spec.title, locale: spec.locale, direction: spec.direction, basePath: spec.output.mode === 'existing-project' ? `/${spec.name}` : '', themeModes: spec.theme.modes, pages: pagesFor(spec) }, null, 2)};\nexport const labels = ${JSON.stringify(spec.locale === 'bg-BG' ? bulgarian : english, null, 2)};\n`;
}
function routesSource(spec: UiSpec) {
  const pages = pagesFor(spec);
  const records: string[] = [];
  for (const page of pages) {
    if (page.recipe === 'crud-list' && page.features.includes('edit')) records.push(`{ path: ${JSON.stringify(`${page.id}/:id`)}, loadComponent: () => import('./user-edit.component').then(module => module.UserEditComponent) }`);
    records.push(`{ path: ${JSON.stringify(page.id)}, loadComponent: () => import('./${page.recipe === 'example' ? 'example' : 'page'}.component').then(module => module.${page.recipe === 'example' ? 'Example' : 'Page'}Component), data: ${JSON.stringify({ recipe: page.recipe, features: page.features })} }`);
  }
  const children = `[{ path: '', redirectTo: ${JSON.stringify(pages[0].id)}, pathMatch: 'full' }, ${records.join(',\n')}, { path: '**', loadComponent: () => import('./page.component').then(module => module.PageComponent) }]`;
  return `import { Routes } from '@angular/router';\nexport const routes: Routes = ${spec.output.mode === 'existing-project' ? `[{ path: ${JSON.stringify(spec.name)}, loadComponent: () => import('./app.component').then(module => module.AppComponent), children: ${children} }]` : children};\n`;
}
export class Generator {
  constructor(readonly registry: Registry, readonly workspace: Workspace, readonly contentDirectory: string) {}
  async plan(input: unknown) {
    const spec = uiSpecSchema.parse(input);
    const snapshot = await this.registry.get(spec.target.sqUiVersion);
    if (spec.target.angularMajor !== snapshot.angularMajor) throw new UiError('ANGULAR_VERSION', 'This snapshot targets Angular 22');
    if (spec.mode === 'example') await this.registry.example(spec.component!, spec.variant, spec.target.sqUiVersion);
    const theme = createTheme(spec.theme, snapshot);
    const limitations = spec.mode === 'example' ? ((await this.registry.component(spec.component!)).limitations ?? []).map(message => ({ code: 'COMPONENT_LIMITATION', severity: 'warning' as const, message })) : [];
    return { spec, snapshot, theme, pages: pagesFor(spec), dependencies: Object.fromEntries(snapshot.modules.filter(module => !module.package.endsWith('/temporal')).map(module => [module.package, module.version])), diagnostics: [...theme.diagnostics, ...limitations], support: { charts: 'external', backend: 'mock', rtl: 'composition', ssr: 'theme-service-only' } };
  }
  async generate(input: unknown, suppliedTheme?: Theme) {
    const plan = await this.plan(input);
    const { spec, snapshot } = plan;
    const theme = suppliedTheme ?? plan.theme;
    if (theme.version !== snapshot.version) throw new UiError('THEME_VERSION', 'Theme and component versions must match');
    if (theme.diagnostics.some(diagnostic => diagnostic.severity === 'error')) throw new UiError('INVALID_THEME', 'Theme checks failed', theme.diagnostics);
    spec.theme = theme.spec;
    const files: Record<string, string> = {};
    if (spec.mode === 'theme') {
      files['theme.json'] = JSON.stringify(theme, null, 2) + '\n'; files['theme.scss'] = theme.css;
      files['theme.service.ts'] = await readFile(path.join(this.contentDirectory, 'templates/admin/theme.service.ts'), 'utf8');
      files['ui-config.ts'] = configSource(spec);
      files['README.md'] = `# ${spec.title}\n\nLoad the public ng-sq-ui styles once, then this theme. Keep .sq on your application root. Inject ThemeService to activate the initial mode, and call set('light' | 'dark' | 'system') to change it.\n`;
    } else {
      for (const file of await readdir(path.join(this.contentDirectory, 'templates/admin'))) files[`src/app/${file}`] = await readFile(path.join(this.contentDirectory, 'templates/admin', file), 'utf8');
      files['src/styles.scss'] = files['src/app/styles.scss']; delete files['src/app/styles.scss'];
      files['src/app/ui-config.ts'] = configSource(spec);
      files['src/app/routes.ts'] = routesSource(spec);
      files['src/theme.scss'] = theme.css;
      files['src/theme.json'] = JSON.stringify(theme, null, 2) + '\n';
      if (spec.mode === 'example') {
        const { demo, variant } = await this.registry.example(spec.component!, spec.variant, snapshot.version);
        const example = fullExample(demo, variant);
        files['src/app/example.component.ts'] = example.typescript;
        files['src/app/example.component.html'] = example.html;
      }
      const dependencies: Record<string, string> = { '@angular/common': '^22.0.0', '@angular/compiler': '^22.0.0', '@angular/core': '^22.0.0', '@angular/forms': '^22.0.0', '@angular/platform-browser': '^22.0.0', '@angular/router': '^22.0.0', '@fortawesome/fontawesome-free': '^6.0.0', rxjs: '^7.8.1', tslib: '^2.8.0' };
      for (const module of snapshot.modules.filter(module => !module.package.endsWith('/temporal'))) {
        const local = `dist/${module.package.slice('@sq-ui/'.length)}`;
        dependencies[module.package] = spec.target.sourceMode === 'workspace' ? `file:${path.relative(path.resolve(this.workspace.root, spec.output.directory), path.resolve(this.workspace.root, local)).replaceAll('\\', '/')}` : module.version;
      }
      files['package.json'] = JSON.stringify({ name: spec.name, version: '0.0.0', private: true, type: 'module', scripts: { start: 'ng serve', build: 'ng build' }, dependencies, devDependencies: { '@angular/build': '^22.0.0', '@angular/cli': '^22.0.0', '@angular/compiler-cli': '^22.0.0', typescript: '~6.0.0' } }, null, 2) + '\n';
      files['angular.json'] = JSON.stringify({ version: 1, projects: { [spec.name]: { projectType: 'application', root: '', sourceRoot: 'src', architect: { build: { builder: '@angular/build:application', options: { browser: 'src/main.ts', index: 'src/index.html', tsConfig: 'tsconfig.json', styles: ['node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css', 'node_modules/@fortawesome/fontawesome-free/css/solid.min.css', 'src/styles.scss'], outputPath: 'dist/app' } }, serve: { builder: '@angular/build:dev-server', options: { buildTarget: `${spec.name}:build` } } } } } }, null, 2) + '\n';
      files['tsconfig.json'] = JSON.stringify({ compilerOptions: { target: 'ES2022', module: 'preserve', moduleResolution: 'bundler', strict: true, experimentalDecorators: true, skipLibCheck: true, lib: ['ES2022', 'DOM'], types: [], outDir: './dist/types' }, angularCompilerOptions: { strictTemplates: true, strictInjectionParameters: true }, include: ['src/**/*.ts'] }, null, 2) + '\n';
      files['src/main.ts'] = `import { bootstrapApplication } from '@angular/platform-browser';\nimport { provideRouter, withHashLocation } from '@angular/router';\nimport { LOCALE_ID } from '@angular/core';\nimport { registerLocaleData } from '@angular/common';\nimport bg from '@angular/common/locales/bg';\nimport { AppComponent } from './app/app.component';\nimport { routes } from './app/routes';\nregisterLocaleData(bg);\nbootstrapApplication(AppComponent, { providers: [provideRouter(routes, withHashLocation()), { provide: LOCALE_ID, useValue: ${JSON.stringify(spec.locale)} }] }).catch(console.error);\n`;
      files['src/index.html'] = `<!doctype html><html lang="${spec.locale}" dir="${spec.direction}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(spec.title)}</title><base href="/"></head><body><app-root></app-root></body></html>\n`;
      files['README.md'] = `# ${spec.title}\n\nAngular 22 / ng-sq-ui ${snapshot.version}.\n\nRun npm install, then npm start. Build with npm run build.\n\nData and login are local demonstrations. No backend authentication is provided.\n${spec.target.sourceMode === 'workspace' ? '\nBuild the seven libraries in the source workspace before installing. For sharing outside this workspace, replace local file dependencies with tested published versions or package tarballs.\n' : ''}`;
    }
    const prefixed: Record<string, string> = {};
    const editable: string[] = [];
    if (spec.output.mode === 'existing-project' && spec.mode !== 'theme') {
      const inspection = await this.workspace.inspect();
      const packageJson = inspection.packageJson as { dependencies?: Record<string, string> } | null;
      const angularVersion = packageJson?.dependencies?.['@angular/core'];
      if (!angularVersion || !/22\./.test(angularVersion)) throw new UiError('ANGULAR_VERSION', 'Existing application must declare Angular 22');
      for (const [name, content] of Object.entries(files)) {
        if (name.startsWith('src/app/')) prefixed[`${spec.output.directory}/${name.slice(8)}`] = content;
        else if (['src/theme.scss', 'src/theme.json', 'src/styles.scss'].includes(name)) prefixed[`${spec.output.directory}/${path.basename(name)}`] = content;
      }
      const routesFile = spec.output.routesFile!;
      const source = await readFile(await this.workspace.resolve(routesFile), 'utf8');
      prefixed[routesFile] = mergeRoutes(source, routesFile, `${spec.output.directory}/routes.ts`, spec.name);
      editable.push(routesFile);
      const stylesFile = spec.output.stylesFile!;
      const stylesheet = await readFile(await this.workspace.resolve(stylesFile), 'utf8');
      let relative = path.posix.relative(path.posix.dirname(stylesFile), `${spec.output.directory}/styles`).replaceAll('\\', '/');
      if (!relative.startsWith('.')) relative = './' + relative;
      const use = `@use '${relative}';`;
      prefixed[stylesFile] = stylesheet.includes(use) ? stylesheet : use + '\n' + stylesheet;
      editable.push(stylesFile);
    } else for (const [name, content] of Object.entries(files)) prefixed[`${spec.output.directory}/${name}`] = content;
    const artifact: Artifact = { id: this.workspace.artifactId(spec.output.directory), directory: spec.output.directory, spec, themeId: theme.id, fileHashes: {} };
    await this.workspace.saveTheme(theme);
    const changeset = await this.workspace.prepare(spec.output.directory, prefixed, artifact, editable);
    changeset.diagnostics = [...theme.diagnostics, ...plan.diagnostics.filter(diagnostic => diagnostic.code === 'COMPONENT_LIMITATION')];
    return { artifactId: artifact.id, changesetId: changeset.id, themeId: theme.id, version: snapshot.version, files: changeset.files, diagnostics: changeset.diagnostics, dependencies: plan.dependencies };
  }
  async updateTheme(artifactId: string, input: unknown) {
    const artifact = await this.workspace.load<Artifact>('artifacts', artifactId);
    const snapshot = await this.registry.get(artifact.spec.target.sqUiVersion);
    const theme = createTheme(input, snapshot);
    if (theme.diagnostics.some(diagnostic => diagnostic.severity === 'error')) throw new UiError('INVALID_THEME', 'Theme checks failed', theme.diagnostics);
    const spec = { ...artifact.spec, theme: theme.spec };
    const themeDirectory = spec.mode === 'theme' || spec.output.mode === 'existing-project' ? artifact.directory : `${artifact.directory}/src`;
    const configDirectory = spec.mode === 'theme' || spec.output.mode === 'existing-project' ? artifact.directory : `${artifact.directory}/src/app`;
    const files = { [`${themeDirectory}/theme.scss`]: theme.css, [`${themeDirectory}/theme.json`]: JSON.stringify(theme, null, 2) + '\n', [`${configDirectory}/ui-config.ts`]: configSource(spec) };
    const next = { ...artifact, spec, themeId: theme.id };
    const changeset = await this.workspace.prepare(artifact.directory, files, next);
    // Theme-only changes preserve ownership of all other generated files.
    const stored = await this.workspace.load<Record<string, unknown>>('changesets', changeset.id);
    await this.workspace.save('changesets', changeset.id, { ...stored, artifact: next });
    await this.workspace.saveTheme(theme);
    return { artifactId, changesetId: changeset.id, themeId: theme.id, files: changeset.files, diagnostics: theme.diagnostics };
  }
}

function escapeHtml(value: string) { return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;'); }
export function mergeRoutes(source: string, filename: string, generated: string, routePrefix: string): string {
  let relative = path.posix.relative(path.posix.dirname(filename), generated).replace(/\.ts$/, '');
  if (!relative.startsWith('.')) relative = './' + relative;
  const identifier = `sqUiRoutes_${routePrefix.replaceAll('-', '_')}`;
  const syntax = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const imported = syntax.statements.find(statement => ts.isImportDeclaration(statement) && ts.isStringLiteral(statement.moduleSpecifier) && statement.moduleSpecifier.text === relative);
  if (imported) return source;
  if (new RegExp(`\\b${identifier}\\b`).test(source)) throw new UiError('ROUTES_CONFLICT', `Import identifier already exists: ${identifier}`);
  let array: ts.ArrayLiteralExpression | undefined;
  const visit = (node: ts.Node) => {
    if (ts.isVariableDeclaration(node) && node.initializer && ts.isArrayLiteralExpression(node.initializer) && (node.type?.getText(syntax).includes('Routes') || /routes/i.test(node.name.getText(syntax)))) array ??= node.initializer;
    ts.forEachChild(node, visit);
  };
  visit(syntax);
  if (!array) throw new UiError('ROUTES_UNSUPPORTED', 'Expected a named routes array; expose it before generating into this application');
  if (array.elements.some(element => ts.isObjectLiteralExpression(element) && element.properties.some(property => ts.isPropertyAssignment(property) && property.name.getText(syntax) === 'path' && ts.isStringLiteral(property.initializer) && property.initializer.text === routePrefix))) throw new UiError('ROUTES_CONFLICT', `Route prefix already exists: ${routePrefix}`);
  return `import { routes as ${identifier} } from ${JSON.stringify(relative)};\n` + source.slice(0, array.getStart(syntax) + 1) + `\n  ...${identifier},\n` + source.slice(array.getStart(syntax) + 1);
}
