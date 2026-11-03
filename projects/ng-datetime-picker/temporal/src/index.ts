/**
 * Secondary entry point: `@sq-ui/ng-datetime-picker/temporal`.
 *
 * This is the single import point for the `Temporal` implementation used by the datetime picker,
 * deliberately published as its own entry point so that applications can alias it:
 *
 * ```ts
 * // src/temporal-native.ts
 * export const Temporal = (globalThis as { Temporal?: unknown }).Temporal;
 * ```
 *
 * ```jsonc
 * // vite / esbuild configuration of your application
 * "resolve": { "alias": { "@sq-ui/ng-datetime-picker/temporal": "src/temporal-native.ts" } }
 * ```
 *
 * With that alias the ~100 kB `@js-temporal/polyfill` is never pulled into the bundle, and the
 * picker keeps working on any platform that provides `Temporal` natively.
 */
export { Temporal } from '@js-temporal/polyfill';
