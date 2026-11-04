import type { LabelValuePair } from '@sq-ui/ng-sq-common';

export type DropdownSize = 's' | 'm' | 'l';

export interface DropdownOption<TValue = unknown> extends LabelValuePair<TValue> {
  disabled?: boolean;
}
