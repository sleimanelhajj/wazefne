import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-home-cta-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cta-footer.component.html',
  styleUrls: ['./cta-footer.component.css'],
})
export class CtaFooterComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
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
