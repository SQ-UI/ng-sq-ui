import { DatetimePickerModule } from './datetime-picker.module';

describe('DatetimePickerModule', () => {
  let datetimePickerModule: DatetimePickerModule;

  beforeEach(() => {
    datetimePickerModule = new DatetimePickerModule();
  });

  it('should create an instance', () => {
    expect(datetimePickerModule).toBeTruthy();
  });
});
