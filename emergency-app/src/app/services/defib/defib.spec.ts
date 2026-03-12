import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DefibService } from './defib';

describe('DefibService', () => {
  let service: DefibService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(DefibService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
