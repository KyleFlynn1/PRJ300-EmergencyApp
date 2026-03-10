import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AlertDetailModalComponent } from './alert-detail-modal.component';
import { Alert } from 'src/app/services/alerts/alert';

describe('AlertDetailModalComponent', () => {
  let component: AlertDetailModalComponent;
  let fixture: ComponentFixture<AlertDetailModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), HttpClientTestingModule, AlertDetailModalComponent],
      providers: [
        { provide: ModalController, useValue: { dismiss: () => Promise.resolve() } },
        { provide: Alert, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AlertDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
