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

  // Unit tests
  // Display alert details correctly
  it('should display alert details correctly', () => {
    const mockAlert: import('src/app/interfaces/report.interface').Report = {
      _id: '1',
      severity: 'High',
      category: 'Test Category',
      notes: 'This is a test alert.',
      location: { lat: 40.7128, lng: -74.0060, address: 'New York' },
      timestamp: new Date().toISOString(),
    };
    component.alert = mockAlert;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.detail-header h1').textContent).toContain('Test Category');
    expect(compiled.querySelector('.description').textContent).toContain('This is a test alert.');
    expect(compiled.querySelector('.severity-badge').textContent).toContain('High');
  });
});
