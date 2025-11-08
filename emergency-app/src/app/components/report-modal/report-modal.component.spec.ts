import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ReportModalComponent } from './report-modal.component';

describe('ReportModalComponent', () => {
  let component: ReportModalComponent;
  let fixture: ComponentFixture<ReportModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ReportModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
