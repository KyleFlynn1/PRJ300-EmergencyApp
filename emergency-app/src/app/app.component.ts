import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonicModule, RouterLink, CommonModule],
})
export class AppComponent implements OnInit {
  showBottomNav = true;
  activeTab = 'home';
  
  constructor(private router: Router) {}

  ngOnInit() {
    // Set initial active tab
    this.updateActiveTab(this.router.url);

    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateActiveTab(event.urlAfterRedirects);
    });
  }

  updateActiveTab(url: string) {
    if (url.includes('/home')) {
      this.activeTab = 'home';
    } else if (url.includes('/alerts')) {
      this.activeTab = 'alerts';
    } else if (url.includes('/map')) {
      this.activeTab = 'map';
    } else if (url.includes('/defibilators')) {
      this.activeTab = 'defib';
    }
  }
}
