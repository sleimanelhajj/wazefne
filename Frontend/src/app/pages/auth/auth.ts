import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LocationService } from '../../services/location.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatDividerModule,
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class AuthComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly locationService = inject(LocationService);
  private readonly cdr = inject(ChangeDetectorRef);

  // create reactive forms for login and signup
  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  readonly signupForm = this.fb.group(
    {
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    { validators: this.matchPasswords },
  );

  protected hideLoginPassword = true;
  protected hideSignupPassword = true;
  protected hideSignupConfirm = true;
  protected loginLoading = false;
  protected signupLoading = false;
  protected loginError = '';
  protected signupError = '';

  protected onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loginLoading = true;
    this.loginError = '';
    const { email, password } = this.loginForm.value;

    //TODO: Remove rememebr
    this.authService
      .login({
        email: email!,
        password: password!,
        remember: false,
      })
      .subscribe({
        next: (response) => {
          console.log('Login successful', response);
          this.loginLoading = false;
          this.locationService.detectCurrentLocation();
          this.router.navigate(['/browse']);
        },
        error: (error) => {
          console.error('Login failed', error);
          this.loginError =
            error.error?.message || 'Login failed. Please check your credentials and try again.';
          this.loginLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  protected onSignupSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.signupLoading = true;
    this.signupError = '';
    const { email, password } = this.signupForm.value;

    this.authService
      .signup({
        email: email!,
        password: password!,
      })
      .subscribe({
        next: (response) => {
          console.log('Signup successful', response);
          this.signupLoading = false;
          this.locationService.detectCurrentLocation();
          this.router.navigate(['/setup-profile']);
        },
        error: (error) => {
          console.error('Signup failed', error);
          this.signupError = error.error?.message || 'Signup failed. Please try again.';
          this.signupLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  // Toggle password visibility
  protected togglePasswordVisibility(target: 'login' | 'signup' | 'signupConfirm'): void {
    switch (target) {
      case 'login':
        this.hideLoginPassword = !this.hideLoginPassword;
        break;
      case 'signup':
        this.hideSignupPassword = !this.hideSignupPassword;
        break;
      case 'signupConfirm':
        this.hideSignupConfirm = !this.hideSignupConfirm;
        break;
    }
  }

  // Custom validator to check if password and confirm password match
  private matchPasswords(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }
}
