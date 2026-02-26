import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth/auth.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class SettingsPage implements OnInit {

  isDarkMode: boolean = false;
  currentUser$: Observable<any>;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private authService: AuthService
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    // Default to dark if no preference saved yet
    const saved = localStorage.getItem('darkMode');
    this.isDarkMode = saved === null ? true : saved === 'true';
    this.applyTheme();
  }

  toggleDarkMode() {
    localStorage.setItem('darkMode', this.isDarkMode.toString());
    this.applyTheme();
  }

  async onLogout() {
    await this.authService.signOut();
    localStorage.removeItem('guestMode');
  }

  private applyTheme() {
    if (this.isDarkMode) {
      this.document.body.classList.add('dark');
      this.document.body.classList.remove('light');
    } else {
      this.document.body.classList.remove('dark');
      this.document.body.classList.add('light');
    }
  }
}
