import { Temporal as PolyfillTemporal } from '@js-temporal/polyfill';

import { Temporal } from './index';

/**
 * Contract test for the `@sq-ui/ng-datetime-picker/temporal` entry point: whatever the secondary
 * entry point exports is the implementation the datetime picker uses, so replacing it (via a bundler
 * alias) must not change the API surface the picker relies on.
 */
describe('@sq-ui/ng-datetime-picker/temporal entry point', () => {
  it('re-exports the polyfill implementation', () => {
    expect(Temporal).toBe(PolyfillTemporal);
  });

  it('exposes the Temporal API the datetime picker relies on', () => {
    expect(typeof Temporal.PlainDate).toBe('function');
    expect(typeof Temporal.PlainTime).toBe('function');
    expect(typeof Temporal.Now).toBe('object');
    expect(Temporal.PlainDate.from('2024-02-29').toString()).toBe('2024-02-29');
  });
});
