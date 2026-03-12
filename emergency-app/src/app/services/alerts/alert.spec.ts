import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Alert } from './alert';

describe('Alert', () => {
  let service: Alert;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(Alert);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
