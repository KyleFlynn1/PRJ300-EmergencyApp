import { Component, Inject, OnInit } from '@angular/core';
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
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})
export class SettingsPage implements  ViewWillEnter {

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

  ionViewWillEnter() {
    const saved = localStorage.getItem('theme');
    const savedRadius = localStorage.getItem('alertRadius');
    if (saved) {
      this.theme = saved;
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.theme = prefersDark ? 'dark' : 'light';
    }
    this.radius = savedRadius ? parseInt(savedRadius) : 50;
    this.applyTheme();
  }

  onThemeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.theme = value;
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  }

  onRadiusChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.radius = parseInt(value);
    localStorage.setItem('alertRadius', value);
  }
  
  async onLogout() {
    await this.authService.signOut();
    localStorage.removeItem('guestMode');
  }

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
