import { Component, OnInit, Input, Output, EventEmitter, input, effect, NgZone } from '@angular/core';
import { ModalController, IonicModule, AlertController } from '@ionic/angular';
import { Report } from 'src/app/interfaces/report.interface';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Alert } from 'src/app/services/alerts/alert';
import { ReactiveFormsModule } from '@angular/forms';
import { GeolocationService } from 'src/app/services/geolocation/geolocation';
import { Capacitor } from '@capacitor/core';
import { PhotoService } from 'src/app/services/photos/photo.service';

@Component({
  selector: 'app-report-modal',
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule , ReactiveFormsModule],
})
export class ReportModalComponent implements OnInit {
  @Input() isNativeModal : boolean = false;
  @Output() closeModal = new EventEmitter<any>();
  @Input() alert?: Report;

  // User location, set from geolocation service
  userLat?: number;
  userLng?: number;
  userAddress?: string;
  photoBase64?: string;

  // Boolean to see if the popup ionic alert is showing or not
  showAlert = false;
  isSubmitting = false;

  // FormGroup for the report form
  reportForm!: FormGroup;

  public formData: Report = {
    severity: 'Info',
    category: 'Other',
    timestamp: new Date().toISOString(),
    location: {},
    notes: ''
  };

  // Severirty and Category options to fill report form options inputs
  public severityOptions = [
    { value: 'Info', label: 'General' },
    { value: 'Low', label: 'Low' },
    { value: 'Moderate', label: 'Moderate' },
    { value: 'High', label: 'High' },
    { value: 'Urgent', label: 'Urgent' }
  ];

  public categoryOptions = [
    'Other',
    'Missing Person',
    'Injury',
    'Tree fallen',
    'Power outage',
    'Fire',
    'Flood',
    'Road blockage',
  ];

  constructor(
    private fb: FormBuilder,
    private modalController: ModalController,
    private alertService: Alert,
    private alertController: AlertController,
    private geolocationService: GeolocationService,
    private photoService: PhotoService,
    private ngZone: NgZone
  ) {}

  async ngOnInit() {
    this.showAlert = true;
    this.reportForm = this.fb.group({
      category: ['', Validators.required],
      severity: ['', Validators.required],
      notes: ['', Validators.maxLength(200)],
      overrideLocation: [false],
      customAddress: ['']
    });
    if (this.alert) {
      this.reportForm.patchValue({
        category: this.alert.category,
        severity: this.alert.severity,
        notes: this.alert.notes,
      });
      // If alert has lat/lng/address, override default gps location with the selected location
      if (this.alert.location && (this.alert.location.lat || this.alert.location.lng)) {
        this.userLat = this.alert.location.lat;
        this.userLng = this.alert.location.lng;
        this.userAddress = this.alert.location.address;
      } else {
        await this.getAndSetUserLocation();
      }
    } else {
      await this.getAndSetUserLocation();
    }
  }

    // Photo logic for form
  photoPreview?: string;

  async onAddPhoto() {
    await this.photoService.addNewToGallery();
    if (this.photoService.photos.length > 0) {
      const photo = this.photoService.photos[0];
      this.setPhotoPreview(photo.webviewPath);
      // Use base64 directly from photoService
      this.photoBase64 = photo.webviewPath;
      this.reportForm.patchValue({ photoUrl: this.photoBase64 || '' });
    }
  }

  retakePhoto() {
    this.onAddPhoto();
  }

  removePhoto() {
    this.photoService.photos.shift();
    this.setPhotoPreview(undefined);
    this.photoBase64 = undefined;
    this.reportForm.patchValue({ photoUrl: '' });
  }

  private setPhotoPreview(path?: string) {
    this.photoPreview = path;
  }

  // Get and set user location
  private async getAndSetUserLocation(): Promise<boolean> {
    try {
      const position = await this.geolocationService.getCurrentLocation();
      if (position) {
        this.userLat = position.coords.latitude;
        this.userLng = position.coords.longitude;
        
        // Get address from coordinates
        try {
          this.userAddress = await this.geolocationService.reverseGeoloc(this.userLat, this.userLng);
        } catch (error) {
          this.userAddress = `${this.userLat.toFixed(4)}, ${this.userLng.toFixed(4)}`;
        }
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Close modal
  cancelReport() {
    if (this.isNativeModal) {
      this.closeModal.emit(null);
    } else {
      this.modalController.dismiss(null, 'cancel');
    }
  }
  updateAlert(id: string, updatedData: Partial<Report>) {
    this.alertService.updateAlert(id, updatedData).subscribe({
      next: (response) => {
        console.log("Alert updated successfully:", response);
        window.location.href = '/home';
      },
      error: async (err) => {
        console.error("Error updating alert:", err);
        const backendMessage = err?.error?.message || 'Could not update the report. Please check your connection and try again.';
        const validationDetails = Array.isArray(err?.error?.errors)
          ? err.error.errors
              .map((e: any) => e?.message || e?.msg || JSON.stringify(e))
              .join('\n')
          : '';
        const alert = await this.alertController.create({
          header: 'Submission Failed',
          message: validationDetails ? `${backendMessage}\n${validationDetails}` : backendMessage,
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }
  
  // Submit report
  async submitReport() {
    if (this.isSubmitting) {
      return;
    }

    if (this.reportForm.invalid) {
      const alert = await this.alertController.create({
        header: 'Invalid Input',
        message: 'Please fill out all required fields.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }
    const currentAlert = this.alert;

    let location: any = {};

    // If editing an alert, preserve original lat/lng unless geocoding succeeds
    if (this.alert && this.alert._id) {
      location = { ...this.alert.location };
      if (this.reportForm.value.overrideLocation && this.reportForm.value.customAddress) {
        // Try geocoding custom address
        try {
          const geoResult = await this.geolocationService.geocodeAddress(this.reportForm.value.customAddress);
          if (geoResult && geoResult.lat && geoResult.lng) {
            location = {
              lat: geoResult.lat,
              lng: geoResult.lng,
              address: this.reportForm.value.customAddress
            };
          } else {
            // Only update address, keep lat/lng
            location.address = this.reportForm.value.customAddress;
          }
        } catch (e) {
          // Only update address, keep lat/lng
          location.address = this.reportForm.value.customAddress;
        }
      }
      const updatedData: Partial<Report> = {
        category: this.reportForm.value.category,
        severity: this.reportForm.value.severity,
        notes: this.reportForm.value.notes,
        location
      };
      this.updateAlert(this.alert._id, updatedData);
      return;
    }
    // New report
    const formData: Report = this.reportForm.value;
    formData.timestamp = new Date().toISOString();
    if (this.reportForm.value.overrideLocation && this.reportForm.value.customAddress) {
      // Try geocoding custom address
      try {
        const geoResult = await this.geolocationService.geocodeAddress(this.reportForm.value.customAddress);
        if (geoResult && geoResult.lat && geoResult.lng) {
          formData.location = {
            lat: geoResult.lat,
            lng: geoResult.lng,
            address: this.reportForm.value.customAddress
          };
        } else if (this.userLat && this.userLng) {
          // If fails then usse device lat/lng, custom address
          formData.location = {
            lat: this.userLat,
            lng: this.userLng,
            address: this.reportForm.value.customAddress
          };
        } else {
          formData.location = { address: this.reportForm.value.customAddress };
        }
      } catch (e) {
        // use device lat/lng, custom address
        if (this.userLat && this.userLng) {
          formData.location = {
            lat: this.userLat,
            lng: this.userLng,
            address: this.reportForm.value.customAddress
          };
        } else {
          formData.location = { address: this.reportForm.value.customAddress };
        }
      }
    } else if (this.userLat && this.userLng) {
      formData.location = {
        lat: this.userLat,
        lng: this.userLng,
        address: this.userAddress
      };
    } else {
      formData.location = { address: 'Unknown Location' };
    }
    this.isSubmitting = true;
    let hasClosed = false;

    const closeModalOnce = (payload: any) => {
      if (hasClosed) {
        return;
      }
      hasClosed = true;
      this.ngZone.run(() => {
        if (this.isNativeModal) {
          this.closeModal.emit(payload);
        } else {
          this.modalController.dismiss(payload, 'confirm');
        }
      });
    };

    const fallbackCloseTimer = setTimeout(() => {
      if (this.isSubmitting) {
        this.isSubmitting = false;
        closeModalOnce({ ...formData, pending: true });
      }
    }, 3500);

    this.alertService.addAlert(formData).subscribe({
      next: (response) => {
        clearTimeout(fallbackCloseTimer);
        this.isSubmitting = false;
        console.log("POST sent successfully:", response);
        closeModalOnce(response);
      },
      error: async () => {
        clearTimeout(fallbackCloseTimer);
        this.isSubmitting = false;
        const alert = await this.alertController.create({
          header: 'Submission Failed',
          message: 'Could not submit the report. Please try again.',
          buttons: ['OK']
        });
        await alert.present();
      },
      complete: () => {
        clearTimeout(fallbackCloseTimer);
        this.isSubmitting = false;
      }
    });
  }

  //Getters for form controls
  get category() {
    return this.reportForm.get('category');
  }

  get severity() {
    return this.reportForm.get('severity');
  }

  get notes() {
    return this.reportForm.get('notes');
  }

  get overrideLocation() {
    return this.reportForm.get('overrideLocation');
  }

  get customAddress() {
    return this.reportForm.get('customAddress');
  }
}