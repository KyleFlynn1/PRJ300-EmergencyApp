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
});
