import { Component, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { Report } from 'src/app/interfaces/report.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Alert } from 'src/app/services/alerts/alert';

@Component({
  selector: 'app-report-modal',
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class ReportModalComponent implements OnInit {

  public formData: Report = {
    severity: 'Info',
    category: 'Other',
    timestamp: new Date().toISOString(),
    location: {},
    notes: ''
  };

  public severityOptions = [
    { value: 'Info', label: 'General' },
    { value: 'Low', label: 'Low' },
    { value: 'Moderate', label: 'Moderate' },
    { value: 'High', label: 'High' }
  ];

  public categoryOptions = [
    'Other',
    'Tree fallen',
    'Power outage',
    'Fire',
    'Flood',
    'Road blockage',
  ];

  constructor(
    private modalController: ModalController,
    private alertService: Alert
  ) {}

  ngOnInit() {}

  cancelReport() {
    this.modalController.dismiss(null, 'cancel');
  }

  submitReport() {
    // Get the current time and date
    this.formData.timestamp = new Date().toISOString();
    // Get a temporary location later on try get the users locations from their phone automatically
    this.formData.location = { address: 'Roscommon' }; 
    this.alertService.addAlert(this.formData);
    this.modalController.dismiss(this.formData, 'confirm');
  }
}