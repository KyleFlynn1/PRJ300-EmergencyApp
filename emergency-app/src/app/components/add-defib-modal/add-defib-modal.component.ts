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
  @Output() closeModal = new EventEmitter<any>();

  // Boolean to see if the popup ionic alert is showing or not
  showAlert = false;

  // User location from geolocation service
  userLat?: number;
  userLng?: number;
  userAddress?: string;
  photoBase64?: string;
  // Using Angular forms for form handling and validation
  defibForm!: FormGroup;


  constructor(
    private fb: FormBuilder,
    private geolocationService: GeolocationService,
    private alertController: AlertController,
    private photoService: PhotoService,
    private defibService: DefibService
  ) { }

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
    } else {
      // Fallback to device location
      await this.getAndSetUserLocation();
    }

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
      this.photoBase64 = await this.toBase64(photo.webviewPath);
      this.defibForm.patchValue({ photoUrl: this.photoBase64 || '' });
    }
  }

  retakePhoto() {
    this.onAddPhoto();
  }

  removePhoto() {
    this.photoService.photos.shift();
    this.setPhotoPreview(undefined);
    this.photoBase64 = undefined;
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

  private async toBase64(path?: string): Promise<string | undefined> {
    if (!path) return undefined;
    if (path.startsWith('data:image/')) return path;
    const res = await fetch(path);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

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
      timestamp: new Date().toISOString(),
      location: { 
        lat: this.userLat,
        lng: this.userLng,
        address: this.userAddress || 'Address not available'
      },
      photoUrl: this.photoBase64 || undefined,
      accessInstructions: this.defibForm.value.accessInstructions || undefined
    };

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
