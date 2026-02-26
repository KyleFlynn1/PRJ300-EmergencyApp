import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.page.html',
  styleUrls: ['./verify-email.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class VerifyEmailPage implements OnInit {
  email: string = '';
  verificationCode: string = '';
  isLoading: boolean = false;
  isResending: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    // Get email from query params
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  async onVerify() {
    if (!this.verificationCode || this.verificationCode.length !== 6) {
      this.errorMessage = 'Please enter a valid 6-digit code';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.confirmSignUp(this.email, this.verificationCode);

      this.showToast('Email verified successfully!', 'success');

      // Navigate to login
      this.router.navigate(['/login']);
    } catch (error: any) {
      console.error('Verification error:', error);

      if (error.code === 'CodeMismatchException') {
        this.errorMessage = 'Invalid verification code';
      } else if (error.code === 'ExpiredCodeException') {
        this.errorMessage = 'Verification code has expired. Please request a new one.';
      } else {
        this.errorMessage = 'Verification failed. Please try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  async onResendCode() {
    if (!this.email) {
      this.errorMessage = 'Email address is missing';
      return;
    }

    this.isResending = true;
    this.errorMessage = '';

    try {
      await this.authService.resendSignUpCode(this.email);
      this.showToast('Verification code sent!', 'success');
    } catch (error: any) {
      console.error('Resend error:', error);
      this.showToast('Failed to resend code', 'danger');
    } finally {
      this.isResending = false;
    }
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }
  async onGoTosignup() {
    this.router.navigate(['/signup']);
  }
}