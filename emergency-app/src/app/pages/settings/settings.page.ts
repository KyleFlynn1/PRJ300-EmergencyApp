import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SettingsPage implements OnInit {

  isDarkMode: boolean = false;

  constructor(@Inject(DOCUMENT) private document: Document) {}

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
