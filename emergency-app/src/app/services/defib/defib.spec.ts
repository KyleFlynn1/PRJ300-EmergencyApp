import { TestBed } from '@angular/core/testing';

import { DefibService } from './defib';

describe('DefibService', () => {
  let service: DefibService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DefibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
