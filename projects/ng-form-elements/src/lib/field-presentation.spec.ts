import { TestBed } from '@angular/core/testing';
import { InputComponent } from './input/input.component';
import { TextareaComponent } from './textarea/textarea.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { TagsInputComponent } from './tags-input/tags-input.component';
import { TypeaheadComponent } from './typeahead/typeahead.component';

// Verify the accessible relationship after moving labels outside the visual control.
for (const control of [InputComponent, TextareaComponent, DropdownComponent, TagsInputComponent, TypeaheadComponent]) {
  describe(`${control.name} field presentation`, () => {
    it('links its label and prioritizes an error, then restores the helper on recovery', () => {
      const fixture = TestBed.createComponent<unknown>(control);
      fixture.componentRef.setInput('controlId', 'presentation-field');
      fixture.componentRef.setInput('controlLabel', 'Your name');
      fixture.componentRef.setInput('helpText', 'Use your full name');
      fixture.detectChanges();
      const root: HTMLElement = fixture.nativeElement;
      const field = root.querySelector('.input-field')!;
      const label = root.querySelector('.sq-field-label')!;
      expect(field.contains(label)).toBe(false);
      const target = root.querySelector<HTMLElement>('#presentation-field')!;
      expect(label.getAttribute('for') === target.id || target.getAttribute('aria-labelledby') === label.id).toBe(true);
      const messageId = target.getAttribute('aria-describedby')!;
      expect(root.querySelector(`#${messageId}`)?.textContent).toBe('Use your full name');

      fixture.componentRef.setInput('errorText', 'Name is required');
      fixture.detectChanges();
      expect(target.getAttribute('aria-invalid')).toBe('true');
      expect(root.querySelector(`#${messageId}`)?.getAttribute('role')).toBe('alert');
      expect(root.querySelector(`#${messageId}`)?.textContent).toBe('Name is required');

      fixture.componentRef.setInput('errorText', '');
      fixture.detectChanges();
      expect(target.hasAttribute('aria-invalid')).toBe(false);
      expect(root.querySelector(`#${messageId}`)?.textContent).toBe('Use your full name');
      fixture.componentRef.setInput('helpText', '');
      fixture.detectChanges();
      expect(target.hasAttribute('aria-describedby')).toBe(false);
      expect(root.querySelector('.sq-field-message')).toBeNull();
    });
  });
}
