import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DefibilatorsPage } from './defibilators.page';

describe('DefibilatorsPage', () => {
  let component: DefibilatorsPage;
  let fixture: ComponentFixture<DefibilatorsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DefibilatorsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
