import { Component, OnInit, Input, Output, EventEmitter, input, effect } from '@angular/core';
import { ModalController, IonicModule, AlertController } from '@ionic/angular';
import { Report } from 'src/app/interfaces/report.interface';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Alert } from 'src/app/services/alerts/alert';
import { ReactiveFormsModule } from '@angular/forms';

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

  // User location hard coded for sligo for testing later got from phone gps
  userLat: number = 54.272470; 
  userLng: number = -8.473997;

  // Boolean to see if the popup ionic alert is showing or not
  showAlert = false;

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
    private alertController: AlertController
  ) {}

  ngOnInit() {
    // Show emergency warning alert on modal open
    this.showAlert = true;

    // Report form initialization with validation
    this.reportForm = this.fb.group({
      category: ['', Validators.required],  // Category is required
      severity: ['', Validators.required], // Severity is required
      notes: ['', Validators.maxLength(200)], // Additional notes are optional
      overrideLocation: [false], // Checkbox for custom location
      customAddress: [''] // Custom address input
    });

    if (this.alert) {
      this.reportForm.patchValue({
        category: this.alert.category,
        severity: this.alert.severity,
        notes: this.alert.notes,
        customAddress: this.alert.location?.address
      });
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
  updateAlert(id: string, updatedData: Report) {
    this.alertService.updateAlert(id, updatedData).subscribe({
      next: (response) => {
        console.log("Alert updated successfully:", response);
        window.location.href = '/home';
      },
      error: (err) => {
        console.error("Error updating alert:", err);
      }
    });
  }
  
  // Submit report
  async submitReport() {
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
    if (this.alert && this.alert._id) {
      const updatedData: Report = {
        category: this.reportForm.value.category,
        severity: this.reportForm.value.severity,
        notes: this.reportForm.value.notes,
        timestamp: this.alert.timestamp, // Keep original timestamp
        location: this.reportForm.value.overrideLocation && this.reportForm.value.customAddress
          ? { address: this.reportForm.value.customAddress }
          : this.alert.location // Keep original location or use custom
      };
      this.updateAlert(this.alert._id, updatedData);
      return;
}
    
    const formData: Report = this.reportForm.value;
    formData.timestamp = new Date().toISOString();
    
    // Use custom address if override is checked, otherwise use default user location
    if (this.reportForm.value.overrideLocation && this.reportForm.value.customAddress) {
      formData.location = { address: this.reportForm.value.customAddress };
    } else {
      formData.location = { 
        lat: this.userLat, 
        lng: this.userLng, 
        address: 'Sligo' 
      };
    }

    this.alertService.addAlert(formData).subscribe({
      next: (response) => {
        console.log("POST sent successfully:", response);
        if (this.isNativeModal) {
          this.closeModal.emit(response);
        } else {
          this.modalController.dismiss(response, 'confirm');
        }
      },
      error: (err) => {
        console.error("Error sending POST:", err);
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