import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule, MenuController } from '@ionic/angular';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DefibilatorsPage } from './defibilators.page';
import { DefibService } from 'src/app/services/defib/defib';
import { of } from 'rxjs';

describe('DefibilatorsPage', () => {
  let component: DefibilatorsPage;
  let fixture: ComponentFixture<DefibilatorsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IonicModule.forRoot(), HttpClientTestingModule, DefibilatorsPage],
      providers: [
        { provide: MenuController, useValue: { enable: () => Promise.resolve() } },
        { provide: DefibService, useValue: { defibs$: of([]), getDefibs: () => of([]) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DefibilatorsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
