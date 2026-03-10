import { Component, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ViewWillEnter } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IonicModule]
})

// Settings page to let user update and change settings
export class SettingsPage implements  ViewWillEnter {
  // Settings options with default values
  theme: string = 'light';
  radius: number = 50;
  isDarkMode: boolean = false;
  currentUser$: Observable<any>;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private authService: AuthService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  // Run every time the page is entered to load settings from local storage and apply theme
  ionViewWillEnter() {
    const saved = localStorage.getItem('theme');
    const savedRadius = localStorage.getItem('alertRadius');

    // if there is a theme go with that if not check system preferences and set theme accordingly
    if (saved) {
      this.theme = saved;
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.theme = prefersDark ? 'dark' : 'light';
    }
    // get default radius from local storage or use default value of 50km
    this.radius = savedRadius ? parseInt(savedRadius) : 50;
    this.applyTheme();
  }

  // Handle theme change event from select dropdown
  onThemeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.theme = value;
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  }

  // Handle radius change event from range input
  onRadiusChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.radius = parseInt(value);
    localStorage.setItem('alertRadius', value);
  }
  
  async onLogout() {
    await this.authService.signOut();
    localStorage.removeItem('guestMode');
  }

  // Apply the selected theme by adding/removing classes on the body element accordingly
  private applyTheme() {
    if (this.theme === 'dark') {
      this.document.body.classList.add('dark');
      this.document.body.classList.remove('light');
    } else {
      this.document.body.classList.remove('dark');
      this.document.body.classList.add('light');
    }
  }
}
