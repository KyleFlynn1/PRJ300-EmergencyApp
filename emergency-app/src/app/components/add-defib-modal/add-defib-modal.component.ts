import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { Defib } from 'src/app/interfaces/defib.interface';
import { GeolocationService } from 'src/app/services/geolocation/geolocation';
import { PhotoService } from 'src/app/services/photos/photo.service';
@Component({
  selector: 'app-add-defib-modal',
  templateUrl: './add-defib-modal.component.html',
  styleUrls: ['./add-defib-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, ReactiveFormsModule]
})
export class AddDefibModalComponent implements OnInit {
  @Input() isNativeModal: boolean = false;
  @Output() closeModal = new EventEmitter<any>();

  // Boolean to see if the popup ionic alert is showing or not
  showAlert = false;

  // User location from geolocation service
  userLat?: number;
  userLng?: number;
  userAddress?: string;
  
  // Using Angular forms for form handling and validation
  defibForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private geolocationService: GeolocationService,
    private alertController: AlertController,
    private photoService: PhotoService
  ) { }

  async ngOnInit() {
    this.showAlert = true;
    // Initialize form with validation - only working status is required
    this.defibForm = this.fb.group({
      working: [true, Validators.required],
      photoUrl: [''],
      accessInstructions: ['']
    });

    // Get user location
    await this.getAndSetUserLocation();

    // If a photo was already taken (unlikely on init), set preview
    if (this.photoService.photos.length > 0) {
      this.setPhotoPreview(this.photoService.photos[0].webviewPath);
    }
  }


  // Photo logic for form
  photoPreview?: string;

  async onAddPhoto() {
    await this.photoService.addNewToGallery();
    if (this.photoService.photos.length > 0) {
      const photo = this.photoService.photos[0];
      this.setPhotoPreview(photo.webviewPath);
      this.defibForm.patchValue({ photoUrl: photo.webviewPath });
    }
  }

  retakePhoto() {
    this.onAddPhoto();
  }

  removePhoto() {
    // Remove from service and form
    this.photoService.photos.shift();
    this.setPhotoPreview(undefined);
    this.defibForm.patchValue({ photoUrl: '' });
  }

  private setPhotoPreview(path?: string) {
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

  async submitDefib() {
    if (this.defibForm.invalid) {
      Object.keys(this.defibForm.controls).forEach(key => {
        this.defibForm.get(key)?.markAsTouched();
      });
      return;
    }

    // Ensure we have a location
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
      timestamp: new Date().toISOString(),
      location: { 
        lat: this.userLat,
        lng: this.userLng,
        address: this.userAddress || 'Address not available'
      },
      photoUrl: this.defibForm.value.photoUrl || undefined,
      accessInstructions: this.defibForm.value.accessInstructions || undefined
    };

    this.closeModal.emit(defibData);
  }

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
