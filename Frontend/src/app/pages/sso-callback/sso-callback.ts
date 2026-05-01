import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sso-callback',
  standalone: true,
  template: `
    <div
      style="display:flex;align-items:center;justify-content:center;height:100vh;background:#f5f7fb;padding:24px;text-align:center;"
    >
      <p style="color:#64748b;font-size:1.1rem;font-weight:500;">
        {{ message }}
      </p>
    </div>
  `,
})
export class SsoCallbackComponent implements OnInit {
  private readonly router = inject(Router);
  protected message = 'Completing sign in…';

  async ngOnInit(): Promise<void> {
    try {
      let clerk = (window as any).Clerk;
      if (!clerk) {
        await new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            clerk = (window as any).Clerk;
            if (clerk) {
              clearInterval(interval);
              resolve();
            }
          }, 50);
        });
      }

      await clerk.load();

      // Clerk reads the URL (which contains tokens Google put there) and populates clerk.client.signIn with what it found.
      const signInAttempt = clerk.client?.signIn;

      // 'transferable' is Clerk's way of saying: "Google verified this person successfully, but they don't have an account in your app yet — you need to create one for them."
      if (signInAttempt?.firstFactorVerification?.status === 'transferable') {
        const signUpAttempt = await clerk.client.signUp.create({ transfer: true });

        if (signUpAttempt.status === 'complete') {
          await clerk.setActive({ session: signUpAttempt.createdSessionId });
          this.router.navigate(['/setup-profile']);
          return;
        }

        if (signUpAttempt.status === 'missing_requirements') {
          this.router.navigate(['/sign-up']);
          return;
        }
      }

      await clerk.handleRedirectCallback({
        afterSignInUrl: '/browse',
        afterSignUpUrl: '/setup-profile',
        signInUrl: '/sign-in',
        signUpUrl: '/sign-up',
      });
    } catch (err: any) {
      console.error('[SSO Callback] Error:', err);
      this.message = 'Authentication failed. Redirecting...';
      setTimeout(() => this.router.navigate(['/sign-in']), 3000);
    }
  }
}
