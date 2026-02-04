import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthCustomService } from 'src/app/services/auth/auth-custom.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, CommonModule, FormsModule, ReactiveFormsModule]
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;
  returnUrl: string = '';

  private fb = inject(FormBuilder);
  private authService = inject(AuthCustomService);
  private router = inject(Router);
  private route = inject(ActivatedRoute)
  constructor(

  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(){
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit() {
    const values = this.loginForm.value;
    console.log('submit with ');
    console.table(values);
    this.authService.login(this.email, this.password).
      subscribe({
        next: response => {
          console.log('user is logged in'),
            this.router.navigateByUrl(this.returnUrl);
        },
        error: (err: Error) => {
          console.log(err.message);
        }

      });

  }
  get email() {
    return this.loginForm.get('email')?.value;
  }
  get password() {
    return this.loginForm.get('password')?.value;
  }

}
