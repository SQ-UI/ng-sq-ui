import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl } from "@angular/forms";
import { FormField, form, required } from "@angular/forms/signals";
import { compatForm } from "@angular/forms/signals/compat";
import { interval } from "rxjs";

import { LabelValuePair } from "@sq-ui/ng-sq-common";
import {
  ButtonComponent,
  CheckboxComponent,
  DropdownComponent,
  FormGroupComponent,
  InputComponent,
  RadiobuttonComponent,
  SqCheckboxLabelTemplateDirective,
  SqDropdownChevronTemplateDirective,
  SqDropdownOptionTemplateDirective,
  SqDropdownSelectedOptionTemplateDirective,
  SqRadiobuttonLabelTemplateDirective,
  SqTagTemplateDirective,
  SqTypeaheadOptionTemplateDirective,
  SqTypeaheadSelectedOptionTemplateDirective,
  TagsInputComponent,
  TextareaComponent,
  TypeaheadComponent,
} from "@sq-ui/ng-form-elements";
import { ProgressBarComponent } from "@sq-ui/ng-progress-bar";

import { CollapseContentComponent, ModuleOverviewComponent, NavItem } from "../../shared";
import { environment } from "../../../environments/environment";

interface TypeaheadResult {
  myCustomProp: string;
  value: string;
  prop: number;
  uid: number;
  nested: { level2: { prop: string } };
}

interface SqUiFormModel {
  name: string;
  dropdown: LabelValuePair | null;
  dropdownWithTemplates: LabelValuePair | null;
  tags: string[];
  typeaheadWithTemplates: TypeaheadResult[];
  typeahead2: string[];
  radioValue: string;
  checkboxValue: boolean;
  textareaValue: string;
}

interface CompatFormModel {
  legacyEmail: FormControl<string>;
}

const INITIAL_SEARCH_RESULTS: TypeaheadResult[] = [
  {
    myCustomProp: "option1",
    value: "someVal1",
    prop: 1,
    uid: 12,
    nested: { level2: { prop: "1" } },
  },
  {
    myCustomProp: "option2",
    value: "someVal2",
    prop: 2,
    uid: 22,
    nested: { level2: { prop: "2" } },
  },
  {
    myCustomProp: "option3",
    value: "someVal3",
    prop: 3,
    uid: 32,
    nested: { level2: { prop: "1" } },
  },
];

@Component({
  selector: "sq-ui",
  templateUrl: "./sq-ui.component.html",
  styleUrls: ["./sq-ui.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ModuleOverviewComponent,
    CollapseContentComponent,
    InputComponent,
    TextareaComponent,
    FormGroupComponent,
    RadiobuttonComponent,
    DropdownComponent,
    TagsInputComponent,
    TypeaheadComponent,
    CheckboxComponent,
    ButtonComponent,
    ProgressBarComponent,
    FormField,
    SqRadiobuttonLabelTemplateDirective,
    SqDropdownOptionTemplateDirective,
    SqDropdownChevronTemplateDirective,
    SqDropdownSelectedOptionTemplateDirective,
    SqTagTemplateDirective,
    SqTypeaheadOptionTemplateDirective,
    SqTypeaheadSelectedOptionTemplateDirective,
    SqCheckboxLabelTemplateDirective,
  ],
})
export class SqUiComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly npmPackageName = "@sq-ui/ng-sq-ui";
  readonly moduleName = "ng-sq-ui (standalone re-exports)";
  readonly internallyDeclared: NavItem[] = [
    {
      name: "ng-form-elements",
      fragment: "formsModule",
    },
    {
      name: "ng-progress-bar",
      fragment: "progressBarModule",
    },
  ];
  readonly dependsOn: NavItem[] = [
    {
      name: "ng-sq-common",
      routeLink: "/sq-common",
    },
    {
      name: "ng-datetime-picker",
      routeLink: "/datetime-picker",
    },
    {
      name: "ng-datatable",
      routeLink: "/datatable",
    },
    {
      name: "ng-modal",
      routeLink: "/modal",
    },
  ];
  readonly exports: NavItem[] = this.internallyDeclared.concat(this.dependsOn);
  readonly docs: NavItem[] = [
    {
      name: "ng-form-elements",
      routeLink: `${environment.docs}/form-elements-module`,
    },
    {
      name: "ng-progress-bar",
      routeLink: `${environment.docs}/progressbar-module`,
    },
  ];

  readonly liveExamples: NavItem[] = [
    {
      name: "ng-sq-ui-form-elements",
      routeLink: `https://ng-sq-ui-form-elements.${environment.livePreview}`,
    },
    {
      name: "ng-sq-ui-progress-bar",
      routeLink: `https://ng-sq-ui-progress-bar.${environment.livePreview}`,
    },
  ];

  readonly dropdownOptions: LabelValuePair[] = [
    { label: "option1", value: "someVal1" },
    { label: "option2", value: "someVal2" },
    { label: "option3", value: "someVal3" },
  ];

  protected readonly searchResults = signal<TypeaheadResult[]>(INITIAL_SEARCH_RESULTS);
  protected readonly searchResultsStrings = signal<string[]>([]);

  protected readonly progressBarLoadedSmall = signal(20);
  protected readonly progressBarLoadedMedium = signal(40);
  protected readonly progressBarLoadedLarge = signal(60);

  protected readonly formModel = signal<SqUiFormModel>({
    name: "",
    dropdown: null,
    dropdownWithTemplates: null,
    tags: ["tag1"],
    typeaheadWithTemplates: [INITIAL_SEARCH_RESULTS[0], INITIAL_SEARCH_RESULTS[2]],
    typeahead2: [],
    radioValue: "value1",
    checkboxValue: false,
    textareaValue: "",
  });

  protected readonly testForm = form(this.formModel, (p) => {
    required(p.name, { message: "Name is required" });
  });

  /**
   * A small demo of the Reactive Forms interop layer: `compatForm` lets a legacy
   * `FormControl` live inside a Signal Forms model so consumers can migrate top-down
   * while still using `[formField]` on the control.
   */
  protected readonly compatModel = signal<CompatFormModel>({
    legacyEmail: new FormControl("", { nonNullable: true }),
  });
  protected readonly compatTestForm = compatForm(this.compatModel);

  constructor() {
    interval(1000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.progressBarLoadedSmall.update((value) => (value + 20 > 100 ? 0 : value + 20));
        this.progressBarLoadedMedium.update((value) => (value + 20 > 100 ? 0 : value + 20));
        this.progressBarLoadedLarge.update((value) => (value + 20 > 100 ? 0 : value + 20));
      });
  }

  searchMethod(_query: string): void {
    this.searchResults.set([...INITIAL_SEARCH_RESULTS]);
  }

  searchMethodString(_query: string): void {
    this.searchResultsStrings.set(["option1", "option2", "option3", "option4"]);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    console.log(this.formModel());
  }
}
