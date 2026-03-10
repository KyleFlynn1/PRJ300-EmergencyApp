import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController, AlertController } from '@ionic/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ReportModalComponent } from './report-modal.component';
import { Alert } from 'src/app/services/alerts/alert';
import { GeolocationService } from 'src/app/services/geolocation/geolocation';
import { PhotoService } from 'src/app/services/photos/photo.service';

describe('ReportModalComponent', () => {
  let component: ReportModalComponent;
  let fixture: ComponentFixture<ReportModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), HttpClientTestingModule, ReportModalComponent],
      providers: [
        { provide: ModalController, useValue: { dismiss: () => Promise.resolve() } },
        { provide: Alert, useValue: {} },
        { provide: AlertController, useValue: { create: () => Promise.resolve({ present: () => Promise.resolve() }) } },
        { provide: GeolocationService, useValue: { getCurrentLocation: () => Promise.resolve(null), reverseGeoloc: () => Promise.resolve('') } },
        { provide: PhotoService, useValue: { photos: [], addNewToGallery: () => Promise.resolve() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
