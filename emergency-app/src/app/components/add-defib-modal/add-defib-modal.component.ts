import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Defib } from 'src/app/interfaces/defib.interface';

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

  // Hardcoded user location for testing
  userLat: number = 54.272470; 
  userLng: number = -8.473997;
  
  // Using Angular forms for form handling and validation
  defibForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {

    this.showAlert = true;
    
    // Initialize form with validation - only working status is required
    this.defibForm = this.fb.group({
      working: [true, Validators.required],
      photoUrl: [''],
      accessInstructions: ['']
    });
  }

  submitDefib() {
    if (this.defibForm.invalid) {
      Object.keys(this.defibForm.controls).forEach(key => {
        this.defibForm.get(key)?.markAsTouched();
      });
      return;
    }

    const defibData: Defib = {
      working: this.defibForm.value.working,
      timestamp: new Date().toISOString(),
      location: { 
        lat: this.userLat,
        lng: this.userLng,
        address: 'Auto-generated location' 
      },
      photoUrl: this.defibForm.value.photoUrl || undefined,
      accessInstructions: this.defibForm.value.accessInstructions || undefined
    };

    console.log('Defibrillator submitted:', defibData);
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
