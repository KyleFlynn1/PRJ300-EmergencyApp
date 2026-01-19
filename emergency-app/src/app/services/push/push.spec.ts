import { TestBed } from '@angular/core/testing';

import { Push } from './push';

describe('Push', () => {
  let service: Push;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Push);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
