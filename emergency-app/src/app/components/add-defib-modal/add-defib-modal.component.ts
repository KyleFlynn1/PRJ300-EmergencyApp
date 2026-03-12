import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Defib } from 'src/app/interfaces/defib.interface';
import { GeolocationService } from 'src/app/services/geolocation/geolocation';
import { PhotoService } from 'src/app/services/photos/photo.service';
import { DefibService } from 'src/app/services/defib/defib';
@Component({
  selector: 'app-add-defib-modal',
  templateUrl: './add-defib-modal.component.html',
  styleUrls: ['./add-defib-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule]
})
export class AddDefibModalComponent implements OnInit {
  @Input() isNativeModal: boolean = false;
  @Input() location?: { lat: number; lng: number; address: string };
  @Input() defib?: Defib;
  @Output() closeModal = new EventEmitter<any>();

  // Boolean to see if the popup ionic alert is showing or not
  showAlert = false;

  // User location from geolocation service
  userLat?: number;
  userLng?: number;
  userAddress?: string;

  // Base64 string for photo to be sent to backend
  photoBase64?: string;

  // Using Angular forms for form handling and validation
  defibForm!: FormGroup;

  // Neccessary services injected via constructor
  constructor(
    private fb: FormBuilder,
    private geolocationService: GeolocationService,
    private alertController: AlertController,
    private photoService: PhotoService,
    private defibService: DefibService
  ) { }

  // On init, set up the form and get user location if permissions allowed and other variables initialized. 
  async ngOnInit() {
    this.showAlert = true;
    // Initialize form with validation - only working status is required
    this.defibForm = this.fb.group({
      working: [true, Validators.required],
      photoUrl: [''],
      accessInstructions: ['']
    });

    // Use provided location from map hold/click if available
    if (this.location) {
      this.userLat = this.location.lat;
      this.userLng = this.location.lng;
      this.userAddress = this.location.address;
    } else if (this.defib && this.defib.location) {
      this.userLat = this.defib.location.lat;
      this.userLng = this.defib.location.lng;
      this.userAddress = this.defib.location.address;
    } else {
      // Fallback to device location
      await this.getAndSetUserLocation();
    }

    // If editing an existing defib, patch form values and load photo
    if (this.defib) {
      this.defibForm.patchValue({
        working: this.defib.working,
        accessInstructions: this.defib.accessInstructions || ''
      });
      if (this.defib.photoUrl) {
        this.photoBase64 = this.defib.photoUrl;
        this.photoPreview = this.defib.photoUrl;
      }
    }

    // If a photo was already taken (unlikely on init), set preview
    if (this.photoService.photos.length > 0) {
      this.setPhotoPreview(this.photoService.photos[0].webviewPath);
    }
  }


  // Photo logic for form
  photoPreview?: string;

  // Handle adding a photo - uses photo service to take photo and convert to base64 for backend
  async onAddPhoto() {
    await this.photoService.addNewToGallery();
    if (this.photoService.photos.length > 0) {
      const photo = this.photoService.photos[0];
      this.setPhotoPreview(photo.webviewPath);
      // Use base64 directly from photoService
      this.photoBase64 = photo.webviewPath;
      this.defibForm.patchValue({ photoUrl: this.photoBase64 || '' });
    }
  }

  // Retake photo just calls the add photo function again and replace the previous photo with the new one
  retakePhoto() {
    this.onAddPhoto();
  }

  // Remove photo clears the photo from the form and resets the preview and base64 variable
  removePhoto() {
    this.photoService.photos.shift();
    this.setPhotoPreview(undefined);
    this.photoBase64 = undefined;
    this.defibForm.patchValue({ photoUrl: '' });
  }

  // Set photo preview for the form  once a photo has been taken
  setPhotoPreview(path?: string) {
    this.photoPreview = path;
  }

  // Get and set user location with reverse geocoding
  private async getAndSetUserLocation(): Promise<boolean> {
    try {
      const position = await this.geolocationService.getCurrentLocation();
      if (position) {
        this.userLat = position.coords.latitude;
        this.userLng = position.coords.longitude;
        console.log('User location:', this.userLat, this.userLng);
        
        // Get address from coordinates using reverse geocoding
        try {
          this.userAddress = await this.geolocationService.reverseGeoloc(this.userLat, this.userLng);
          console.log('User address:', this.userAddress);
        } catch (error) {
          console.error('Error getting address:', error);
          this.userAddress = 'Address not available';
        }
        
        return true;
      } else {
        this.userLat = undefined;
        this.userLng = undefined;
        this.userAddress = undefined;
        return false;
      }
    } catch (error) {
      this.userLat = undefined;
      this.userLng = undefined;
      this.userAddress = undefined;
      return false;
    }
  }

  // Form submission logic - validates form, checks for location, constructs defib object, and sends to backend via defib service
  async submitDefib() {
    if (this.defibForm.invalid) {
      Object.keys(this.defibForm.controls).forEach(key => {
        this.defibForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.userLat || !this.userLng) {
      const alert = await this.alertController.create({
        header: 'Location Required',
        message: 'Unable to get your location. Please enable location permissions and try again.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    const defibData: Defib = {
      working: this.defibForm.value.working,
      timestamp: this.defib ? this.defib.timestamp : new Date().toISOString(),
      location: { 
        lat: this.userLat,
        lng: this.userLng,
        address: this.userAddress || 'Address not available'
      },
      photoUrl: this.photoBase64 || (this.defib?.photoUrl) || undefined,
      accessInstructions: this.defibForm.value.accessInstructions || undefined
    };

    // If editing an existing defib, update instead of add
    if (this.defib && this.defib._id) {
      this.defibService.updateDefib(this.defib._id, defibData).subscribe({
        next: () => {
          this.closeModal.emit(defibData);
        },
        error: async () => {
          const alert = await this.alertController.create({
            header: 'Update Failed',
            message: 'Could not update defibrillator. Please try again.',
            buttons: ['OK']
          });
          await alert.present();
        }
      });
      return;
    }

    this.defibService.addDefib(defibData).subscribe({
      next: () => {
        this.closeModal.emit(defibData);
      },
      error: async () => {
        const alert = await this.alertController.create({
          header: 'Save Failed',
          message: 'Could not save defibrillator. Please try again.',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  

  // Cancel just closes the modal without sending any data back
  cancel() {
    this.closeModal.emit(null);
  }

  // Getters for form controls
  get working() {
    return this.defibForm.get('working');
  }

  get accessInstructions() {
    return this.defibForm.get('accessInstructions');
  }

  get photoUrl() {
    return this.defibForm.get('photoUrl');
  }
}
