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

  // Unit Tests

  // Test getseveritycolor utility function returns correct color for severity levels
  it('should return correct color for severity levels', () => {
    expect(component.getAlertSeverityColor('low')).toBe('#339900');
    expect(component.getAlertSeverityColor('moderate')).toBe('#FFCC00');
    expect(component.getAlertSeverityColor('high')).toBe('#F46A25');
    expect(component.getAlertSeverityColor('urgent')).toBe('#FF0000');
    expect(component.getAlertSeverityColor('failtest')).toBe('#797979');
  });

  // Test getIcon utility function returns correct icon for categories
  it('should return correct icon for categories', () => {
    expect(component.getIcon('Fire')).toBe('flame');
    expect(component.getIcon('Flood')).toBe('water');
    expect(component.getIcon('Fail')).toBe('alert-circle');
    expect(component.getIcon('Other')).toBe('alert-circle');
  });

  // Test getFormattedTimestamp utility function formats date correctly
  it('should format timestamp correctly', () => {
    const date = new Date('2024-01-01T12:00:00Z');
    expect(component.getFormattedTimestamp(date.toISOString())).toBe('Jan 1 12:00');
  });
});
