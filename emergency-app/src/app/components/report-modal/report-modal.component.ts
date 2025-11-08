import { Component, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { Report } from 'src/app/interfaces/report.interface';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-report-modal',
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule]
})
export class ReportModalComponent implements OnInit {

  public formData: Report = {
    severity: 'low',
    category: 'Other',
    timestamp: new Date().toISOString(),
    location: {},
    notes: ''
  };

  public severityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  public categoryOptions = [
    'Tree fallen',
    'Power outage',
    'Fire',
    'Flood',
    'Road blockage',
    'Other'
  ];

  constructor(private modalController: ModalController) {}

  ngOnInit() {}

  cancelReport() {
    this.modalController.dismiss(null, 'cancel');
  }

  submitReport() {
    // Get the current time and date
    this.formData.timestamp = new Date().toISOString();
    // Get a temporary location later on try get the users locations from their phone automatically
    this.formData.location = { lat: 0, lng: 0 }; 
    this.modalController.dismiss(this.formData, 'confirm');
  }
}