import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, AlertController } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { AddDefibModalComponent } from './add-defib-modal.component';
import { GeolocationService } from 'src/app/services/geolocation/geolocation';
import { PhotoService } from 'src/app/services/photos/photo.service';
import { DefibService } from 'src/app/services/defib/defib';

describe('AddDefibModalComponent', () => {
  let component: AddDefibModalComponent;
  let fixture: ComponentFixture<AddDefibModalComponent>;
  let mockGeolocationService: jasmine.SpyObj<GeolocationService>;
  let mockPhotoService: jasmine.SpyObj<PhotoService>;
  let mockDefibService: jasmine.SpyObj<DefibService>;
  let mockAlertController: jasmine.SpyObj<AlertController>;

  beforeEach(waitForAsync(() => {
    mockGeolocationService = jasmine.createSpyObj('GeolocationService', ['getCurrentLocation', 'reverseGeoloc']);
    mockPhotoService = jasmine.createSpyObj('PhotoService', ['addNewToGallery'], { photos: [] });
    mockDefibService = jasmine.createSpyObj('DefibService', ['addDefib']);
    mockAlertController = jasmine.createSpyObj('AlertController', ['create']);

    // Default mock returns
    mockGeolocationService.getCurrentLocation.and.returnValue(Promise.resolve({
      coords: { latitude: 53.35, longitude: -6.26 }
    } as GeolocationPosition));
    mockGeolocationService.reverseGeoloc.and.returnValue(Promise.resolve('Dublin, Ireland'));
    mockAlertController.create.and.returnValue(Promise.resolve({ present: () => Promise.resolve() } as any));

    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), ReactiveFormsModule, AddDefibModalComponent],
      providers: [
        { provide: GeolocationService, useValue: mockGeolocationService },
        { provide: PhotoService, useValue: mockPhotoService },
        { provide: DefibService, useValue: mockDefibService },
        { provide: AlertController, useValue: mockAlertController },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddDefibModalComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form with default values', async () => {
    await component.ngOnInit();
    expect(component.defibForm).toBeTruthy();
    expect(component.defibForm.get('working')?.value).toBeTrue();
    expect(component.defibForm.get('photoUrl')?.value).toBe('');
    expect(component.defibForm.get('accessInstructions')?.value).toBe('');
  });

  it('should use provided location instead of device location', async () => {
    component.location = { lat: 51.5, lng: -0.12, address: 'London, UK' };
    await component.ngOnInit();
    expect(component.userLat).toBe(51.5);
    expect(component.userLng).toBe(-0.12);
    expect(component.userAddress).toBe('London, UK');
    expect(mockGeolocationService.getCurrentLocation).not.toHaveBeenCalled();
  });

  it('should fall back to device location when no location input', async () => {
    await component.ngOnInit();
    expect(mockGeolocationService.getCurrentLocation).toHaveBeenCalled();
    expect(component.userLat).toBe(53.35);
    expect(component.userLng).toBe(-6.26);
    expect(component.userAddress).toBe('Dublin, Ireland');
  });

  it('should handle geolocation failure gracefully', async () => {
    mockGeolocationService.getCurrentLocation.and.returnValue(Promise.resolve(null as any));
    await component.ngOnInit();
    expect(component.userLat).toBeUndefined();
    expect(component.userLng).toBeUndefined();
  });

  it('should emit null on cancel', () => {
    spyOn(component.closeModal, 'emit');
    component.cancel();
    expect(component.closeModal.emit).toHaveBeenCalledWith(null);
  });

  it('should not submit if form is invalid', async () => {
    await component.ngOnInit();
    component.defibForm.get('working')?.setValue(null);
    component.defibForm.get('working')?.setErrors({ required: true });
    await component.submitDefib();
    expect(mockDefibService.addDefib).not.toHaveBeenCalled();
  });

  it('should show alert if location is missing on submit', async () => {
    await component.ngOnInit();
    component.userLat = undefined;
    component.userLng = undefined;
    await component.submitDefib();
    expect(mockAlertController.create).toHaveBeenCalled();
    expect(mockDefibService.addDefib).not.toHaveBeenCalled();
  });

  it('should show alert on submit error', async () => {
    component.location = { lat: 53.35, lng: -6.26, address: 'Dublin' };
    await component.ngOnInit();
    mockDefibService.addDefib.and.returnValue(throwError(() => new Error('fail')));

    await component.submitDefib();

    expect(mockAlertController.create).toHaveBeenCalledWith(
      jasmine.objectContaining({ header: 'Save Failed' })
    );
  });

  it('should remove photo and clear form value', async () => {
    await component.ngOnInit();
    (mockPhotoService as any).photos = [{ filepath: 'test', webviewPath: 'data:image/png;base64,abc' }];
    component.photoPreview = 'data:image/png;base64,abc';
    component.photoBase64 = 'data:image/png;base64,abc';
    component.defibForm.patchValue({ photoUrl: 'data:image/png;base64,abc' });

    component.removePhoto();

    expect(component.photoPreview).toBeUndefined();
    expect(component.photoBase64).toBeUndefined();
    expect(component.defibForm.get('photoUrl')?.value).toBe('');
  });
});
