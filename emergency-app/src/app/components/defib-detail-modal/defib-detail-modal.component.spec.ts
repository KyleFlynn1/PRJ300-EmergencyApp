import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DefibDetailModalComponent } from './defib-detail-modal.component';
import { DefibService } from 'src/app/services/defib/defib';

describe('DefibDetailModalComponent', () => {
  let component: DefibDetailModalComponent;
  let fixture: ComponentFixture<DefibDetailModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), HttpClientTestingModule, DefibDetailModalComponent],
      providers: [
        { provide: ModalController, useValue: { dismiss: () => Promise.resolve() } },
        { provide: DefibService, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DefibDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

   // Unit tests
  // Display alert details correctly
  it('should display defib details correctly', () => {
    const mockDefib: import('src/app/interfaces/defib.interface').Defib = {
      _id: '1',
      working: true,
      accessInstructions: 'Test Defib',
      location: { lat: 40.7128, lng: -74.0060, address: 'New York' },
      timestamp: new Date().toISOString(),
    };
    component.defib = mockDefib;
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.description').textContent).toContain('Test Defib');
    expect(compiled.querySelector('.active-badge').textContent).toContain('Working');
    expect(compiled.querySelector('.info-content .value').textContent).toContain('New York');
  });
});
