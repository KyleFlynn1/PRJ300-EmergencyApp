import { TestBed } from '@angular/core/testing';

import { Defib } from './defib';

describe('Defib', () => {
  let service: Defib;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Defib);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
