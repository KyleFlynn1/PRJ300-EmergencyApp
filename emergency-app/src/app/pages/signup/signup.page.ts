import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class SignupPage {
  nickname: string = ''; // NEW
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastController: ToastController
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async onSignUp() {
    // Validation
    if (!this.nickname || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Pass nickname as an attribute
      await this.authService.signUp(this.email, this.password, {
        nickname: this.nickname
      });

      await this.showToast('Account created! Please check your email to verify your account.', 'success');

      // Navigate to verification page
      this.router.navigate(['/verify-email'], {
        queryParams: { email: this.email }
      });
    } catch (error: any) {
      console.error('Sign up error:', error);

      if (error.code === 'UsernameExistsException') {
        this.errorMessage = 'An account with this email already exists';
      } else if (error.code === 'InvalidPasswordException') {
        this.errorMessage = 'Password does not meet requirements';
      } else {
        this.errorMessage = error.message || 'Sign up failed. Please try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top'
    });
    await toast.present();
  }
}