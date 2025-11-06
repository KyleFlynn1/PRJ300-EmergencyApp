import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonButtons,
        IonMenuButton,
        IonCard,
        IonCardContent,
        IonIcon,
        IonBadge,
        IonButton
      } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton, IonCard, IonCardContent, IonIcon, IonBadge, IonButton]
})
export class HomePage implements OnInit {

  // Test Data
  activeAlerts: any[] = [];
  recentBroadcasts: any[] = [];

  constructor() { }

  ngOnInit() {
  }

}
