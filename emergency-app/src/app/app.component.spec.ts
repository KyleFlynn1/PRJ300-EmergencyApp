import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AppComponent } from './app.component';
import { NotificationsService } from 'src/app/services/notifications/notifications';
import { AuthService } from 'src/app/services/auth/auth.service';
import { of } from 'rxjs';

describe('AppComponent', () => {
  it('should create the app', async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        { provide: NotificationsService, useValue: {} },
        { provide: AuthService, useValue: { currentUser$: of(null), getCurrentUser: () => Promise.resolve(null) } }
      ]
    }).compileComponents();
    
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
