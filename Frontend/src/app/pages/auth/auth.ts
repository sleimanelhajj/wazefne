import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
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
  protected successMessage = '';
  protected showPassword = false;

  // state machine: 
  // | 'signin-identifier'   // Step 1: Enter email/username
  // | 'signin-password'     // Step 2: Enter password
  // | 'second-factor'       // Step 3 (optional): 2FA code
  // | 'signup'              // Sign up form
  // | 'forgot'              // Forgot password form
  // | 'verify'              // Enter password reset code
  // | 'otp'                 // Enter email login code (for Google users)
  // | 'email-verify'        // Verify email after sign up
  // | 'missing-fields'      // Enter username (for OAuth users)
  protected step:
    | 'signin-identifier'
    | 'signin-password'
    | 'second-factor'
    | 'signup'
    | 'forgot'
    | 'verify'
    | 'otp'
    | 'email-verify'
    | 'missing-fields' = 'signin-identifier';

  // Form fields
  protected identifier = '';
  protected email = '';
  protected password = '';
  protected firstName = '';
  protected lastName = '';
  protected username = '';
  protected resetCode = '';
  protected newPassword = '';
  protected otpCode = '';

  async ngOnInit(): Promise<void> {
    this.isSignUp = this.router.url.includes('sign-up');
    this.step = this.isSignUp ? 'signup' : 'signin-identifier';

    if (!this.isSignUp) return;
    
    // If the user explicitly navigated here fresh (e.g. via toggleMode),
    // skip restoring any stale Clerk session so they get a clean form.
    if ((history.state as any)?.fresh === true) return;

    // CHECK FOR INCOMPLETE STATES (Like missing usernames from Google OAuth)
    try {
      const clerk = (window as any).Clerk;
      await clerk.load();
      const signUp = clerk.client?.signUp;

      if (signUp && signUp.status === 'missing_requirements') {
        if (signUp.missingFields.includes('username')) {
          this.step = 'missing-fields';
        } else if (signUp.unverifiedFields.includes('email_address')) {
          this.step = 'email-verify';
        }
        this.cdr.detectChanges();
      }
    } catch (e) {
      // Ignore load errors on init
    }
  }

  async onSubmit(): Promise<void> {
    if (this.isSignUp) {
      await this.signUp();
    } else if (this.step === 'signin-identifier') {
      await this.startSignIn();
    } else if (this.step === 'signin-password') {
      await this.submitPassword();
    }
  }

  // ─── 1. SIGN IN (IDENTIFIER FIRST) ──────────────────────────────────

  private async startSignIn(): Promise<void> {
    if (!this.identifier) {
      this.error = 'Please enter your email or username.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      const clerk = (window as any).Clerk;

      // Step 1: Tell Clerk who is trying to sign in
      const signIn = await clerk.client.signIn.create({
        identifier: this.identifier,
      });

      // Step 2: Determine how they are allowed to authenticate
      const factors = signIn.supportedFirstFactors;
      const hasPassword = factors.find((f: any) => f.strategy === 'password');
      const emailCodeFactor = factors.find((f: any) => f.strategy === 'email_code');

      if (hasPassword) {
        // Normal account with a password, move to input password screen
        this.step = 'signin-password';
      } else if (emailCodeFactor) {
        // OAuth account  with NOOO password. Trigger OTP!
        await clerk.client.signIn.prepareFirstFactor({
          strategy: 'email_code',
          emailAddressId: emailCodeFactor.emailAddressId,
        });
        this.successMessage =
          "This account uses Google. We've sent a temporary login code to your email.";
        this.step = 'otp';
      } else {
        this.error = 'Please sign in with your social provider directly.';
      }
    } catch (err: any) {
      this.error = err.errors?.[0]?.longMessage || 'Account not found. Please check your spelling.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  private async submitPassword(): Promise<void> {
    if (!this.password) {
      this.error = 'Please enter your password.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      const clerk = (window as any).Clerk;
      // Step 3: Attempt the password
      const result = await clerk.client.signIn.attemptFirstFactor({
        strategy: 'password',
        password: this.password,
      });

      if (result.status === 'complete') {
        await clerk.setActive({ session: result.createdSessionId });
        this.router.navigate(['/browse']);
      } else if (result.status === 'needs_second_factor' || result.status === 'needs_client_trust') {
        await clerk.client.signIn.prepareSecondFactor({ strategy: 'email_code' });
        this.successMessage = 'A verification code was sent to your email.';
        this.step = 'second-factor';
      }
    } catch (err: any) {
      this.error = err.errors?.[0]?.longMessage || 'Incorrect password.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async verifySignInOtp(): Promise<void> {
    this.isLoading = true;
    this.error = '';
    try {
      const clerk = (window as any).Clerk;
      const result = this.step === 'second-factor'
        ? await clerk.client.signIn.attemptSecondFactor({ strategy: 'email_code', code: this.otpCode })
        : await clerk.client.signIn.attemptFirstFactor({ strategy: 'email_code', code: this.otpCode });

      if (result.status === 'complete') {
        await clerk.setActive({ session: result.createdSessionId });
        this.router.navigate(['/browse']);
      }
    } catch (err: any) {
      this.error = 'Invalid code. Please try again.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // ─── 2. SIGN UP & MISSING FIELDS ────────────────────────────────────

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
      } else if (result.status === 'missing_requirements') {
        await clerk.client.signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        this.step = 'email-verify';
      }
    } catch (err: any) {
      this.error = err.errors?.[0]?.longMessage || 'Sign up failed.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async verifySignUpEmail(): Promise<void> {
    this.isLoading = true;
    this.error = '';
    try {
      const clerk = (window as any).Clerk;
      const result = await clerk.client.signUp.attemptEmailAddressVerification({
        code: this.otpCode,
      });

      if (result.status === 'complete') {
        await clerk.setActive({ session: result.createdSessionId });
        this.router.navigate(['/setup-profile']);
      } else if (
        result.status === 'missing_requirements' &&
        result.missingFields.includes('username')
      ) {
        this.step = 'missing-fields';
      }
    } catch (err: any) {
      this.error = 'Invalid code. Please try again.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // incase signup with google and missing username
  async submitMissingFields(): Promise<void> {
    if (!this.username) {
      this.error = 'Username is required.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      const clerk = (window as any).Clerk;
      const result = await clerk.client.signUp.update({ username: this.username });

      if (result.status === 'complete') {
        await clerk.setActive({ session: result.createdSessionId });
        this.router.navigate(['/setup-profile']);
      }
    } catch (err: any) {
      this.error = err.errors?.[0]?.longMessage || 'Failed to update username.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // ─── 3. PASSWORD RESET & UI HELPERS ─────────────────────────────────

  async forgotPassword(): Promise<void> {
    if (!this.identifier) {
      this.error = 'Please enter your email or username.';
      return;
    }

    this.isLoading = true;
    this.error = '';

    try {
      const clerk = (window as any).Clerk;

      // Step 1: Create a sign-in attempt to fetch the user's data
      const signIn = await clerk.client.signIn.create({
        identifier: this.identifier,
      });

      // Step 2: Find the password reset strategy in their supported factors
      const resetFactor = signIn.supportedFirstFactors?.find(
        (f: any) => f.strategy === 'reset_password_email_code',
      );

      // If they don't have this factor, it means they only use Google/OAuth
      if (!resetFactor) {
        this.error =
          'Password reset not supported. Please sign in with Google or use an email login code.';
        this.isLoading = false;
        return;
      }

      // Step 3: Trigger the reset email using their specific emailAddressId
      await clerk.client.signIn.prepareFirstFactor({
        strategy: 'reset_password_email_code',
        emailAddressId: resetFactor.emailAddressId,
      });

      this.successMessage = 'A reset code has been sent to your email.';
      this.step = 'verify';
    } catch (err: any) {
      this.error =
        err.errors?.[0]?.longMessage ||
        'Failed to send reset email. Make sure the username/email exists.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async resetPassword(): Promise<void> {
    if (!this.resetCode || !this.newPassword) return;
    this.isLoading = true;
    this.error = '';
    try {
      const clerk = (window as any).Clerk;
      const result = await clerk.client.signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: this.resetCode,
        password: this.newPassword,
      });
      if (result.status === 'complete') {
        await clerk.setActive({ session: result.createdSessionId });
        this.router.navigate(['/browse']);
      }
    } catch (err: any) {
      this.error = 'Password reset failed. Invalid code.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  // toggle between sign in and sign up forms
  toggleMode(): void {
    this.error = '';
    this.successMessage = '';
    if (this.isSignUp) {
      this.router.navigate(['/sign-in']);
    } else {
      this.router.navigate(['/sign-up'], { state: { fresh: true } });
    }
  }


  goToForgotPassword(): void {
    this.error = '';
    this.step = 'forgot';
  }

  async goBackToSignUp(): Promise<void> {
    this.error = '';
    this.successMessage = '';
    this.otpCode = '';

    // Abandon any pending Clerk sign-up (e.g. OAuth missing username)
    // so that clicking Google again starts a completely fresh attempt
    // instead of resuming the stale one and falling back to Clerk's hosted UI.
    try {
      const clerk = (window as any).Clerk;
      const signUp = clerk.client?.signUp;
      if (signUp?.status === 'missing_requirements') {
        await signUp.abandon();
      }
    } catch {
      // Ignore errors on abandon
    }

    this.step = 'signup';
  }

  goBackToSignIn(): void {
    this.error = '';
    this.successMessage = '';
    this.otpCode = '';
    this.password = '';
    this.step = 'signin-identifier';
  }

  async signInWithGoogle(): Promise<void> {
    await this.socialSignIn('oauth_google');
  }
  async signInWithGithub(): Promise<void> {
    await this.socialSignIn('oauth_github');
  }
  async signInWithMicrosoft(): Promise<void> {
    await this.socialSignIn('oauth_microsoft');
  }

  private async socialSignIn(strategy: string): Promise<void> {
    this.error = '';
    try {
      const clerk = (window as any).Clerk;

      // Always use signIn for OAuth — never signUp.
      // If the user is new, the SSO callback's transfer flow creates a fresh
      // sign-up via signUp.create({ transfer: true }), which avoids reusing
      // any stale signUp object that is stuck in missing_requirements.
      await clerk.client.signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: `${environment.frontendUrl}/sso-callback`,
        redirectUrlComplete: this.step === 'signup' ? '/setup-profile' : '/browse',
      });
    } catch (err: any) {
      this.error = 'Social connection failed.';
      this.cdr.detectChanges();
    }
  }
}
