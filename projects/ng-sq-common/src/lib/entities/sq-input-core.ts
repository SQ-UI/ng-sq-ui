import { Directive, input, output } from '@angular/core';
import { DisabledReason, ValidationError, WithOptionalFieldTree } from '@angular/forms/signals';

/**
 * Shared host inputs for SQ form controls.
 *
 * This is not a `ControlValueAccessor` base — it only exposes the common
 * presentational/state inputs (label, placeholder, disabled state, errors, etc.)
 * so that subclasses can compose them with the Signal Forms `FormValueControl`
 * or `FormCheckboxControl` contracts by adding their own `value`/`checked` model.
 **/
@Directive()
export abstract class SqInputCore {
  private readonly defaultId = `sq-form-control-${Math.random().toString(36).slice(2)}`;

  readonly name = input<string>(this.defaultId);
  readonly controlId = input<string>(this.defaultId);
  readonly controlLabel = input<string>('');
  readonly controlPlaceholder = input<string>('');
  readonly required = input<boolean>(false);
  readonly pattern = input<readonly RegExp[]>([]);
  readonly disabled = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly hidden = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly errors = input<readonly ValidationError.WithOptionalFieldTree[]>([]);
  readonly disabledReasons = input<readonly WithOptionalFieldTree<DisabledReason>[]>([]);
  readonly touch = output<void>();

  protected emitTouch(): void {
    this.touch.emit();
  }
}
