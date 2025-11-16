import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-alert-detail-modal',
  templateUrl: './alert-detail-modal.component.html',
  styleUrls: ['./alert-detail-modal.component.scss'],
  imports: [IonicModule],
  standalone: true,
})
export class AlertDetailModalComponent  implements OnInit {

  constructor(
    private modalController: ModalController
  ) {}

  ngOnInit() {}

  closeDetailedView() {
    this.modalController.dismiss(null, 'cancel');
  }
}
