import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { Alert } from 'src/app/services/alerts/alert';
import { Weather } from 'src/app/interfaces/weather.interface';
import { getAlertSeverityColor, getCircleAlertSVG, getIcon } from 'src/app/utils/modalUtil';
import { Clipboard } from '@capacitor/clipboard';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-weather-detail-modal',
  templateUrl: './weather-detail-modal.component.html',
  styleUrls: ['./weather-detail-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class WeatherDetailModalComponent  implements OnInit {
  // Call utility functions
  getAlertSeverityColor = getAlertSeverityColor;
  getIcon = getIcon;
  // Control to  show update form or detail view
  showform: boolean = false;
  @Input() isNativeModal : boolean = false;
  @Input() weather?: Weather;
  
  //  inject services required
  constructor(
    private modalController: ModalController,
    private alertService: Alert
  ) {}

  // Log the weather received and details to make sure its working correct
  ngOnInit() {
    console.log('WeatherDetailModal received weather:', this.weather);
  }


  // COPY or share alert details to clipboradd

  copyAlertDetails = async (weather: Weather | undefined) => {
    if (!weather) {
      return;
    }
    const details =
      `Weather Alert: ${weather?.headline || 'N/A'}\n` +
      `Event: ${weather?.event || 'N/A'}\n` +
      `Severity: ${weather?.severity || 'N/A'}\n` +
      `Description: ${weather?.description || 'N/A'}\n` +
      `Active: From ${weather?.onset ? (new Date(weather.onset)).toLocaleString() : 'N/A'} Until ${weather?.expires ? (new Date(weather.expires)).toLocaleString() : 'N/A'}\n` +
      `Urgency: ${weather?.urgency || 'N/A'}\n` +
      `Certainty: ${weather?.certainty || 'N/A'}\n` +
      (weather?.areaDesc ? `Area: ${weather.areaDesc}\n` : '') +
      (weather?.author ? `Author: ${weather.author}\n` : '') +
      (weather?.pubdate ? `Issued: ${(new Date(weather.pubdate)).toLocaleString()}\n` : '') +
      (weather?.guid ? `Official Alert: ${weather.guid}` : '');

    await Clipboard.write({
      string: details
    });
  }

  // Close modal
  async closeDetailedView() {
    if (!this.isNativeModal) {
      await this.modalController.dismiss();
    } else {
      // If using native modal, navigate to home
      window.location.href = '/home';
    }
  }

  // Handle form close event
  handleFormClose(data: any) {
    if (data) {
      // Form was submitted, close the detail modal
      this.closeDetailedView();
    } else {
      // Form was cancelled, go back to detail view
      this.showform = false;
    }
  }
}
