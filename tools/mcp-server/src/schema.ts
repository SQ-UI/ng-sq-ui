import * as z from 'zod/v4';

export const slug = z.string().regex(/^[a-z][a-z0-9-]{0,63}$/);
export const relativePath = z.string().min(1).max(240).refine(value => !value.includes('\\') && !value.startsWith('/') && value.split('/').every(segment => segment !== '..' && segment !== '.' && !!segment) && !/[:\p{Cc}]/u.test(value), 'Use a relative path without traversal');
export const themeSchema = z.object({
  name: slug.default('custom'), brand: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#00c474'),
  modes: z.array(z.enum(['light', 'dark', 'system'])).min(1).refine(values => new Set(values).size === values.length).default(['light', 'dark', 'system']),
  density: z.enum(['compact', 'comfortable']).default('comfortable'), radius: z.number().int().min(0).max(24).default(6),
  font: z.enum(['system', 'grotesk', 'mono']).default('system'),
  overrides: z.record(z.string(), z.string().max(200).refine(value => !/[;{}@<>\\\p{Cc}]/u.test(value) && !/(?:url|expression)\s*\(/i.test(value), 'Use a CSS value without rules, URLs or scripts')).default({})
}).strict();
export const recipeNames = ['dashboard-summary', 'crud-list', 'settings-form', 'login'] as const;
export const uiSpecSchema = z.object({
  schemaVersion: z.literal(1).default(1), mode: z.enum(['theme', 'example', 'page', 'application']),
  name: slug.default('sq-ui-example'), title: z.string().min(1).max(100).default('Workspace'),
  target: z.object({ angularMajor: z.literal(22).default(22), sqUiVersion: z.string().optional(), sourceMode: z.enum(['workspace', 'installed']).default('workspace') }).strict().default({ angularMajor: 22, sourceMode: 'workspace' }),
  blueprint: z.enum(['admin-basic', 'dashboard-summary', 'crud-list', 'settings-form', 'login']).default('admin-basic'),
  component: z.string().max(100).optional(), variant: z.string().max(100).optional(),
  theme: themeSchema.default({ name: 'custom', brand: '#00c474', modes: ['light', 'dark', 'system'], density: 'comfortable', radius: 6, font: 'system', overrides: {} }),
  locale: z.enum(['en-US', 'bg-BG']).default('en-US'), direction: z.enum(['ltr', 'rtl']).default('ltr'),
  pages: z.array(z.object({ id: slug, recipe: z.enum(recipeNames), features: z.array(z.enum(['search', 'filter', 'sort', 'paginate', 'edit', 'delete'])).optional() }).strict()).min(1).max(12).optional(),
  dataProvider: z.literal('mock').default('mock'),
  output: z.object({ mode: z.enum(['new-project', 'existing-project']).default('new-project'), directory: relativePath, routesFile: relativePath.optional(), stylesFile: relativePath.optional() }).strict()
}).strict().superRefine((spec, ctx) => {
  if (spec.mode === 'example' && !spec.component) ctx.addIssue({ code: 'custom', path: ['component'], message: 'A component is required for an example' });
  if (spec.pages && new Set(spec.pages.map(page => page.id)).size !== spec.pages.length) ctx.addIssue({ code: 'custom', path: ['pages'], message: 'Page IDs must be unique' });
  if (spec.mode === 'page' && spec.blueprint === 'admin-basic') ctx.addIssue({ code: 'custom', path: ['blueprint'], message: 'Choose a page blueprint' });
  if (spec.output.mode === 'existing-project' && (!spec.output.routesFile || !spec.output.stylesFile)) ctx.addIssue({ code: 'custom', path: ['output'], message: 'Existing projects require routesFile and stylesFile relative to the workspace' });
});
export type UiSpec = z.infer<typeof uiSpecSchema>;
export type ThemeSpec = z.infer<typeof themeSchema>;
export const querySchema = z.object({ version: z.string().optional(), query: z.string().max(200).default(''), category: z.string().optional(), package: z.string().optional(), kind: z.string().optional(), cursor: z.coerce.number().int().min(0).default(0), limit: z.number().int().min(1).max(100).default(30) }).strict();
export const idSchema = z.object({ id: z.string().min(1).max(200), version: z.string().optional() }).strict();
export const resultSchema = z.object({ ok: z.boolean(), data: z.unknown().optional(), error: z.object({ code: z.string(), message: z.string(), details: z.unknown().optional() }).optional() });
