import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet, IonIcon } from '@ionic/angular/standalone';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonApp, IonRouterOutlet, IonIcon, RouterLink, RouterLinkActive],
})
export class AppComponent {
  constructor() {
    // Load saved theme preference, default to dark if not set
    const savedDark = localStorage.getItem('darkMode');
    if (savedDark === null || savedDark === 'true') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }
}
