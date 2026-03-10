import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, MenuController } from '@ionic/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { HomePage } from './home.page';
import { Alert } from 'src/app/services/alerts/alert';
import { GeolocationService } from 'src/app/services/geolocation/geolocation';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), HttpClientTestingModule, HomePage],
      providers: [
        provideRouter([]),
        { provide: MenuController, useValue: { enable: () => Promise.resolve() } },
        { provide: Alert, useValue: { alerts$: of([]), weatherAlerts$: of([]), getAlerts: () => of([]), getWeatherAlerts: () => of([]) } },
        { provide: GeolocationService, useValue: { getCurrentLocation: () => Promise.resolve(null) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
