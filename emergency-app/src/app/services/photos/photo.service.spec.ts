import { TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular';

import { PhotoService } from './photo.service';

describe('PhotoService', () => {
  let service: PhotoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Platform, useValue: { is: () => false } }
      ]
    });
    service = TestBed.inject(PhotoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
