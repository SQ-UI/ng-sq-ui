import type { Snapshot, Diagnostic } from './types';
import { themeSchema, type ThemeSpec } from './schema';
import { digest } from './registry';
import { UiError } from './errors';

function rgb(hex: string) { return [1, 3, 5].map(index => parseInt(hex.slice(index, index + 2), 16)); }
function hex(values: number[]) { return '#' + values.map(value => Math.round(value).toString(16).padStart(2, '0')).join(''); }
function blend(left: string, right: string, amount: number) { const a = rgb(left), b = rgb(right); return hex(a.map((value, index) => value * (1 - amount) + b[index] * amount)); }
function luminance(color: string) { return rgb(color).map(value => { const normalized = value / 255; return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4; }).reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0); }
export function contrast(left: string, right: string): number { const a = luminance(left), b = luminance(right); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); }
function readable(seed: string, surface: string, minimum = 4.5) {
  const destination = luminance(surface) > 0.3 ? '#000000' : '#ffffff';
  for (let step = 0; step <= 100; step++) { const color = blend(seed, destination, step / 100); if (contrast(color, surface) >= minimum) return color; }
  return destination;
}
export interface Theme {
  id: string; schemaVersion: number; version: string; spec: ThemeSpec;
  light: Record<string, string>; dark: Record<string, string>; css: string;
  checks: { mode: string; foreground: string; background: string; ratio: number; passed: boolean }[];
  diagnostics: Diagnostic[];
}
export function createTheme(input: unknown, snapshot: Snapshot): Theme {
  const spec = themeSchema.parse(input);
  const allowed = new Set(snapshot.tokens.map(token => token.name));
  for (const key of Object.keys(spec.overrides)) if (!allowed.has(key)) throw new UiError('UNKNOWN_TOKEN', `Unknown theme token: ${key}`);
  const make = (dark: boolean): Record<string, string> => {
    const surface = dark ? '#18212f' : '#ffffff';
    const text = dark ? '#f1f5f9' : '#202020';
    const subtle = dark ? '#222f42' : '#f3f6f5';
    const brand = readable(spec.brand, surface, 5.5);
    const font = spec.font === 'mono' ? 'ui-monospace, SFMono-Regular, Consolas, monospace' : spec.font === 'grotesk' ? '"Space Grotesk", system-ui, sans-serif' : 'system-ui, -apple-system, "Segoe UI", sans-serif';
    const onBrand = contrast('#ffffff', brand) >= 4.5 ? '#ffffff' : '#111827';
    return {
      ...Object.fromEntries(snapshot.tokens.map(token => [token.name, token.value])),
      'color-brand': brand, 'color-brand-light': blend(spec.brand, surface, dark ? 0.80 : 0.92),
      'color-text': text, 'color-label': text, 'color-surface': surface, 'color-surface-subtle': subtle,
      'color-border': dark ? '#8090a8' : '#7d8d86', 'color-focus': brand,
      'color-placeholder': dark ? '#b4c1d1' : '#56645d',
      'color-critical': readable('#dc2626', surface), 'color-error-border': readable('#dc2626', surface),
      'color-ok': readable('#15803d', surface), 'color-warning': readable('#a16207', surface),
      'color-on-brand': onBrand, 'color-action-hover': text, 'color-on-action-hover': surface,
      'color-action-surface': surface, 'color-action-disabled-text': dark ? '#111827' : '#ffffff',
      'color-disabled': dark ? '#9ba8b7' : '#6b756e', 'color-disabled-surface': subtle, 'color-disabled-border': dark ? '#65748b' : '#a2b0a7',
      'color-disabled-checkbox-border': dark ? '#65748b' : '#a2b0a7', 'color-disabled-radio-border': dark ? '#65748b' : '#a2b0a7',
      'color-secondary': subtle, 'color-selection': blend(spec.brand, surface, 0.84), 'color-selection-muted': blend(spec.brand, surface, 0.84),
      'color-stripe': subtle, 'color-progress-track': dark ? '#43516a' : '#c8d4cd',
      'color-table-heading': dark ? '#0c1422' : '#202020', 'color-table-heading-text': '#ffffff', 'color-table-border': dark ? '#65748b' : '#c8d4cd',
      'color-calendar-heading-border': dark ? '#65748b' : '#c8d4cd', 'color-calendar-option': subtle, 'color-calendar-outside': dark ? '#b4c1d1' : '#56645d', 'color-calendar-disabled': dark ? '#9ba8b7' : '#6b756e',
      'color-range-edge': brand, 'color-range-preview': blend(spec.brand, surface, 0.84), 'color-loader-accent': brand,
      'color-overlay': dark ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.4)',
      'shadow-field': dark ? '0 4px 16px rgba(0, 0, 0, 0.5)' : '0 4px 16px rgba(0, 0, 0, 0.15)',
      'shadow-modal': dark ? '0 16px 48px rgba(0, 0, 0, 0.65)' : '0 16px 48px rgba(0, 0, 0, 0.24)',
      'font-family': font, 'font-family-sans': font, 'font-family-display': font,
      'font-family-mono': 'ui-monospace, SFMono-Regular, Consolas, monospace',
      'radius-control': `${spec.radius}px`, 'font-size-field-small': spec.density === 'compact' ? '13px' : '14px',
      'line-height-field-small': spec.density === 'compact' ? '20px' : '24px',
      'font-size-assistive': '12px', 'line-height-assistive': '20px', ...spec.overrides
    };
  };
  const light = make(false), dark = make(true);
  const rules = (values: Record<string, string>) => Object.entries(values).map(([key, value]) => `  --sq-${key}: ${value};`).join('\n');
  const css = `/* Generated ng-sq-ui ${snapshot.version} theme. Brand seed: ${spec.brand}. */\n:root, .sq {\n${rules(light)}\n}\n` +
    (spec.modes.includes('dark') || spec.modes.includes('system') ? `[data-sq-theme="dark"], [data-sq-theme="dark"] .sq {\n${rules(dark)}\n}\n` : '') +
    (spec.modes.includes('system') ? `@media (prefers-color-scheme: dark) { :root:not([data-sq-theme="light"]):not([data-sq-theme="dark"]), :root:not([data-sq-theme="light"]):not([data-sq-theme="dark"]) .sq {\n${rules(dark)}\n} }\n` : '') +
    `:root { color-scheme: light; }\n[data-sq-theme="dark"] { color-scheme: dark; }\n`;
  const pairs = [['color-text', 'color-surface'], ['color-label', 'color-surface'], ['color-brand', 'color-surface'], ['color-critical', 'color-surface'], ['color-placeholder', 'color-surface'], ['color-on-brand', 'color-brand']];
  const checks = Object.entries({ light, dark }).flatMap(([mode, values]) => pairs.map(([foreground, background]) => {
    const parseable = /^#[0-9a-f]{6}$/i.test(values[foreground]) && /^#[0-9a-f]{6}$/i.test(values[background]);
    const ratio = parseable ? contrast(values[foreground], values[background]) : 0;
    return { mode, foreground, background, ratio: Math.round(ratio * 100) / 100, passed: ratio >= 4.5 };
  }));
  const diagnostics: Diagnostic[] = checks.filter(check => !check.passed).map(check => ({ code: 'THEME_CONTRAST', severity: 'error', message: `${check.mode}: ${check.foreground}/${check.background} contrast ${check.ratio}; use opaque hex colors with at least 4.5 contrast` }));
  if (light['color-brand'].toLowerCase() !== spec.brand.toLowerCase()) diagnostics.push({ code: 'BRAND_ADJUSTED', severity: 'info', message: `Brand seed ${spec.brand} uses ${light['color-brand']} for readable light-mode actions and links` });
  if (spec.font === 'grotesk') diagnostics.push({ code: 'FONT_REQUIRED', severity: 'warning', message: 'Supply a licensed Space Grotesk webfont; the generated theme falls back to system fonts' });
  return { id: `theme-${digest(JSON.stringify({ spec, digest: snapshot.sourceDigest })).slice(0, 16)}`, schemaVersion: 1, version: snapshot.version, spec, light, dark, css, checks, diagnostics };
}
