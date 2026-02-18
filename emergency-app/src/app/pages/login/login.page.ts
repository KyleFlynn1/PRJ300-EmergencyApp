import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class LoginPage {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onLogin() {
    // Validation
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Sign in with Cognito
      await this.authService.signIn(this.email, this.password);

      // Show success message
      await this.showToast('Login successful!', 'success');

      // Navigate to home page
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle specific Cognito errors
      if (error.code === 'UserNotConfirmedException') {
        this.errorMessage = 'Please verify your email before logging in';
        // Optionally navigate to verification page
        this.router.navigate(['/verify-email'], {
          queryParams: { email: this.email }
        });
      } else if (error.code === 'NotAuthorizedException') {
        this.errorMessage = 'Incorrect email or password';
      } else if (error.code === 'UserNotFoundException') {
        this.errorMessage = 'User not found. Please sign up first.';
      } else {
        this.errorMessage = 'Login failed. Please try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  async onForgotPassword() {
    const alert = await this.alertController.create({
      header: 'Reset Password',
      message: 'Enter your email to receive password reset instructions',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email',
          value: this.email
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Send',
          handler: async (data) => {
            if (data.email) {
              try {
                await this.authService.forgotPassword(data.email);
                await this.showToast('Password reset email sent!', 'success');
              } catch (error) {
                await this.showToast('Failed to send reset email', 'danger');
              }
            }
          }
        }
      ]
    });

    await alert.present();
  }

  onSignUp() {
    this.router.navigate(['/signup']);
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
}