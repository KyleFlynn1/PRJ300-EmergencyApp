import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, MenuController, ModalController } from '@ionic/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { AlertsPage } from './alerts.page';
import { Alert } from 'src/app/services/alerts/alert';
import { GeolocationService } from 'src/app/services/geolocation/geolocation';

describe('AlertsPage', () => {
  let component: AlertsPage;
  let fixture: ComponentFixture<AlertsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), HttpClientTestingModule, AlertsPage],
      providers: [
        { provide: MenuController, useValue: { enable: () => Promise.resolve() } },
        { provide: Alert, useValue: { alerts$: of([]), weatherAlerts$: of([]), getAlerts: () => of([]), getWeatherAlerts: () => of([]) } },
        { provide: GeolocationService, useValue: { getCurrentLocation: () => Promise.resolve(null) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
