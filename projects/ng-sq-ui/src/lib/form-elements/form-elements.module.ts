import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// modules
import { SharedModule } from '../shared/shared.module';

// components
import { InputComponent } from './input/input.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { TagsInputComponent } from './tags-input/tags-input.component';
import { RadiobuttonComponent } from './radiobutton/radiobutton.component';
import { FormGroupComponent } from './form-group/form-group.component';
import { TypeaheadComponent } from './typeahead/typeahead.component';
import { CheckboxComponent } from './checkbox/checkbox.component';
import { ButtonComponent } from './button/button.component';
import { TextareaComponent } from './textarea/textarea.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    InputComponent,
    DropdownComponent,
    TagsInputComponent,
    RadiobuttonComponent,
    FormGroupComponent,
    TypeaheadComponent,
    CheckboxComponent,
    ButtonComponent,
    TextareaComponent
  ],
  exports: [
    InputComponent,
    DropdownComponent,
    TagsInputComponent,
    RadiobuttonComponent,
    FormGroupComponent,
    TypeaheadComponent,
    CheckboxComponent,
    ButtonComponent,
    TextareaComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class FormElementsModule { }
