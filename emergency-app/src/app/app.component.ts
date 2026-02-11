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
    // Temporary manual theme switch for 'dark' or 'light
    document.body.classList.add('dark');
  }
}
