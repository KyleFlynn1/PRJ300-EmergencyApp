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

  theme: string = 'dark';
  radius: number = 50;

  constructor(@Inject(DOCUMENT) private document: Document) {}

  ngOnInit() {
    const saved = localStorage.getItem('theme');
    this.theme = saved ? saved : 'dark';
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
    localStorage.setItem('alertRadius', value);
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
