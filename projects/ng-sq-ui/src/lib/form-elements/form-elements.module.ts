import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// modules
import { NgSqCommonModule } from '@sq-ui/ng-sq-common';

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
import { SqDropdownChevronTemplateDirective, SqDropdownOptionTemplateDirective, SqDropdownSelectedOptionTemplateDirective } from './dropdown/dropdown-templates.directive';
import { SqRadiobuttonLabelTemplateDirective } from './radiobutton/radiobutton-templates.directive';
import { SqTagTemplateDirective } from './tags-input/tags-input-templates.directive';
import { SqTypeaheadOptionTemplateDirective, SqTypeaheadSelectedOptionTemplateDirective } from './typeahead/typeahead-templates.directive';
import { SqCheckboxLabelTemplateDirective } from './checkbox/checkbox-templates.directive';

@NgModule({
  imports: [
    CommonModule,
    NgSqCommonModule,
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
    TextareaComponent,
    SqDropdownOptionTemplateDirective,
    SqDropdownChevronTemplateDirective,
    SqDropdownSelectedOptionTemplateDirective,
    SqRadiobuttonLabelTemplateDirective,
    SqTagTemplateDirective,
    SqTypeaheadOptionTemplateDirective,
    SqTypeaheadSelectedOptionTemplateDirective,
    SqCheckboxLabelTemplateDirective
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
    TextareaComponent,
    SqDropdownOptionTemplateDirective,
    SqDropdownChevronTemplateDirective,
    SqDropdownSelectedOptionTemplateDirective,
    SqRadiobuttonLabelTemplateDirective,
    SqTagTemplateDirective,
    SqTypeaheadOptionTemplateDirective,
    SqTypeaheadSelectedOptionTemplateDirective,
    SqCheckboxLabelTemplateDirective
  ]
})
export class FormElementsModule { }
