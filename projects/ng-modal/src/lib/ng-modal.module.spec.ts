import { NgModalModule } from './ng-modal.module';

describe('NgModalModule', () => {
  let modalModule: NgModalModule;

  beforeEach(() => {
    modalModule = new NgModalModule();
  });

  it('should create an instance', () => {
    expect(modalModule).toBeTruthy();
  });
});
