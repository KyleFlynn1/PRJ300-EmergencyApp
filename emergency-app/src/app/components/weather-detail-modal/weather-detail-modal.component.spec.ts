import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { WeatherDetailModalComponent } from './weather-detail-modal.component';
import { Alert } from 'src/app/services/alerts/alert';

describe('WeatherDetailModalComponent', () => {
  let component: WeatherDetailModalComponent;
  let fixture: ComponentFixture<WeatherDetailModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), HttpClientTestingModule, WeatherDetailModalComponent],
      providers: [
        { provide: ModalController, useValue: { dismiss: () => Promise.resolve() } },
        { provide: Alert, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WeatherDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
