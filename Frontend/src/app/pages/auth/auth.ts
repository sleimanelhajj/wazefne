import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class AuthComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  protected isSignUp = false;
  protected isLoading = false;
  protected error = '';
  protected showPassword = false;

  // Form fields
  protected email = '';
  protected password = '';
  protected firstName = '';
  protected lastName = '';

  ngOnInit(): void {
    this.isSignUp = this.router.url.includes('sign-up');
  }

  async onSubmit(): Promise<void> {
    if (this.isSignUp) {
      await this.signUp();
    } else {
      await this.signIn();
    }
  }

  private async signIn(): Promise<void> {
    if (!this.email || !this.password) {
      this.error = 'Please enter your email and password.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      const clerk = (window as any).Clerk;
      const result = await clerk.client.signIn.create({
        identifier: this.email,
        password: this.password,
      });

      if (result.status === 'complete') {
        await clerk.setActive({ session: result.createdSessionId });
        this.router.navigate(['/browse']);
      }
    } catch (err: any) {
      this.error =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        'Sign in failed. Please check your credentials.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private async signUp(): Promise<void> {
    if (!this.email || !this.password) {
      this.error = 'Please enter your email and password.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      const clerk = (window as any).Clerk;
      const result = await clerk.client.signUp.create({
        emailAddress: this.email,
        password: this.password,
        firstName: this.firstName || undefined,
        lastName: this.lastName || undefined,
      });

      if (result.status === 'complete') {
        await clerk.setActive({ session: result.createdSessionId });
        this.router.navigate(['/setup-profile']);
      } else {
        // Handle email verification step if Clerk requires it
        this.error = 'Please check your email to verify your account.';
      }
    } catch (err: any) {
      this.error =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        'Sign up failed. Please try again.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  toggleMode(): void {
    this.error = '';
    if (this.isSignUp) {
      this.router.navigate(['/sign-in']);
    } else {
      this.router.navigate(['/sign-up']);
    }
  }
}
