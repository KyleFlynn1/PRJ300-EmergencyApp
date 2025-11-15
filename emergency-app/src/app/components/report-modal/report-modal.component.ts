import { Component, OnInit } from '@angular/core';
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
    this.showAlert = true;

    // Report form initialization with validation
    this.reportForm = this.fb.group({
      category: ['', Validators.required],  // Category is required
      severity: ['', Validators.required], // Severity is required
      notes: [''] // Additional notes are optional
    });
  }

  cancelReport() {
    this.modalController.dismiss(null, 'cancel');
  }

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
    
    const formData: Report = this.reportForm.value;
    formData.timestamp = new Date().toISOString();
    formData.location = { address: 'Roscommon' }; // Temporary location

    this.alertService.addAlert(formData);
    this.modalController.dismiss(formData, 'confirm');
  }


  get category() {
    return this.reportForm.get('category');
  }

  get severity() {
    return this.reportForm.get('severity');
  }

  get notes() {
    return this.reportForm.get('notes');
  }
}