import { Component, inject, NgZone } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { ClerkService } from 'ngx-clerk';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly clerk = inject(ClerkService);
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);

  constructor() {
    const router = this.router;
    const ngZone = this.ngZone;

    /**
     * Helper to correctly parse Clerk's internal URLs which use hash-based routing
     * (e.g. /sign-up#/continue?params). The default ngx-clerk implementation uses
     * `to.replace('#/', '')` which mangles these into invalid paths like /sign-upcontinue.
     */
    const clerkNavigate = (to: string, replaceUrl = false) => {
      return ngZone.run(() => {
        const hashIndex = to.indexOf('#/');
        let navigatePath: string;
        let hash = '';

        if (hashIndex !== -1) {
          navigatePath = to.substring(0, hashIndex) || '/';
          hash = to.substring(hashIndex);
        } else {
          navigatePath = to;
        }

        const url = new URL(navigatePath, 'http://dummy.clerk');
        const queryParams = Object.fromEntries(url.searchParams.entries());

        return router
          .navigate([url.pathname || '/'], { queryParams, replaceUrl })
          .then((result) => {
            if (hash) {
              window.location.hash = hash;
            }
            return result;
          });
      });
    };

    this.clerk.__init({
      publishableKey: 'pk_test_Zmx1ZW50LXRlcnJhcGluLTc0LmNsZXJrLmFjY291bnRzLmRldiQ',
      routerPush: (to: string) => clerkNavigate(to, false),
      routerReplace: (to: string) => clerkNavigate(to, true),
    });
  }
}
