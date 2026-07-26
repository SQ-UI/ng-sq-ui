import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { FormField, form } from "@angular/forms/signals";
import { Temporal } from "@js-temporal/polyfill";

import { ButtonComponent } from "@sq-ui/ng-form-elements";
import { DatetimePickerComponent, TimePickerComponent } from "@sq-ui/ng-datetime-picker";

import { CollapseContentComponent, ModuleOverviewComponent, NavItem } from "../../shared";
import { environment } from "../../../environments/environment";

interface DatetimePickerFormModel {
  standAloneDatepicker: Temporal.PlainDate | Temporal.PlainDate[] | null;
  datetimePicker: Temporal.PlainDate | Temporal.PlainDate[] | null;
  standAloneTimepicker: Temporal.PlainTime | null;
}

@Component({
  selector: "sq-datatime-picker-docs",
  templateUrl: "./datatime-picker-docs.component.html",
  styleUrls: ["./datatime-picker-docs.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ModuleOverviewComponent,
    CollapseContentComponent,
    DatetimePickerComponent,
    TimePickerComponent,
    ButtonComponent,
    FormField,
  ],
})
export class DatatimePickerDocsComponent {
  readonly npmPackageName = "@sq-ui/ng-datetime-picker";
  readonly moduleName = "ng-datetime-picker (standalone)";
  readonly dependsOn: NavItem[] = [
    {
      name: "ng-sq-common",
      routeLink: "/sq-common",
    },
  ];

  readonly exports: NavItem[] = [
    {
      name: "sq-datetime-picker",
      fragment: "datepicker",
    },
    {
      name: "sq-time-picker",
      fragment: "timepicker",
    },
    { name: "DatetimePickerValue (type)" },
  ];

  readonly docs: NavItem[] = [
    {
      name: "ng-datetime-picker",
      routeLink: `${environment.docs}/datetime-picker-module`,
    },
  ];

  readonly liveExamples: NavItem[] = [
    {
      name: "ng-sq-ui-datetime-picker",
      routeLink: `https://ng-sq-ui-datetime-picker.${environment.livePreview}`,
    },
  ];

  readonly isDatepickerMultipleSelect = true;
  readonly minDate = Temporal.Now.plainDateISO();
  readonly maxDate = Temporal.Now.plainDateISO().add({ years: 5 });

  readonly standAloneTimepicker = {
    hourStep: 1,
    minuteStep: 1,
    hours: 13,
    minutes: 20,
    isMeridiem: false,
    isEditable: false,
  };

  protected readonly formModel = signal<DatetimePickerFormModel>({
    standAloneDatepicker: Temporal.Now.plainDateISO().add({ days: 1 }),
    datetimePicker: Temporal.Now.plainDateISO().add({ days: 1 }),
    standAloneTimepicker: null,
  });

  protected readonly testForm = form(this.formModel);

  hoursChange(hours: number): void {
    console.log(`The current chosen hours are: ${hours}`);
  }

  minutesChange(minutes: number): void {
    console.log(`The current chosen minutes are: ${minutes}`);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    console.log(this.formModel());
  }
}
