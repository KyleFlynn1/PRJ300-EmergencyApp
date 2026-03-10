import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, MenuController } from '@ionic/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MapPage } from './map.page';
import { Alert } from 'src/app/services/alerts/alert';
import { of } from 'rxjs';

describe('MapPage', () => {
  let component: MapPage;
  let fixture: ComponentFixture<MapPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), HttpClientTestingModule, MapPage],
      providers: [
        { provide: MenuController, useValue: { enable: () => Promise.resolve() } },
        { provide: Alert, useValue: { alerts$: of([]), weatherAlerts$: of([]), getAlerts: () => of([]), getWeatherAlerts: () => of([]) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MapPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
