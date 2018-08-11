import { ModalModule } from './modal.module';

describe('ModalModule', () => {
  let modalModule: ModalModule;

  beforeEach(() => {
    modalModule = new ModalModule();
  });

  it('should create an instance', () => {
    expect(modalModule).toBeTruthy();
  });
});
