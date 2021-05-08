import { ProgressBarModule } from './progress-bar.module';

describe('ProgressBarModule', () => {
  let progressBarModule: ProgressBarModule;

  beforeEach(() => {
    progressBarModule = new ProgressBarModule();
  });

  it('should create an instance', () => {
    expect(progressBarModule).toBeTruthy();
  });
});
