import { TestBed } from '@angular/core/testing';

import { AuthCustomService } from './auth-custom.service';

describe('AuthCustomService', () => {
  let service: AuthCustomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthCustomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
