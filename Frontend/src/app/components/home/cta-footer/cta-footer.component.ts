import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home-cta-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cta-footer.component.html',
  styleUrls: ['./cta-footer.component.css'],
})
export class CtaFooterComponent implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  isLoggedIn = false;
  private authSub?: Subscription;

  ngOnInit(): void {
    const checkAuthStatus = () => {
      const isNowLoggedIn = this.authService.isAuthenticated();
      if (this.isLoggedIn !== isNowLoggedIn) {
        this.isLoggedIn = isNowLoggedIn;
        this.cdr.detectChanges();
      }
    };

    checkAuthStatus();
    const loadInterval = setInterval(checkAuthStatus, 100);
    setTimeout(() => clearInterval(loadInterval), 2000);

    this.authSub = this.authService.isSignedIn$.subscribe(() => {
      checkAuthStatus();
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  onCtaPrimary(): void {
    if (this.isLoggedIn) {
      this.router.navigate(['/browse']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  onLearnMore(): void {
    // Scroll to the "How it Works" section
    const el = document.querySelector('app-home-process');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
