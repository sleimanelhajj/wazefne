import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { ProcessComponent } from '../../components/home/process/process.component';
import { HomeCategoriesComponent } from '../../components/home/categories/categories.component';
import { CtaFooterComponent } from '../../components/home/cta-footer/cta-footer.component';
import { TopBarComponent } from '../../components/common/top-bar/top-bar.component';
import { HomeHeroComponent } from '../../components/home/hero/hero.component';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  imports: [
    CommonModule,
    TopBarComponent,
    HomeCategoriesComponent,
    ProcessComponent,
    CtaFooterComponent,
    HomeHeroComponent,
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
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

    this.authSub = this.authService.isSignedIn$.subscribe(() => checkAuthStatus());
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  goToBrowse(): void {
    this.router.navigate(['/browse']);
  }

  goToSignIn(): void {
    this.router.navigate(['/sign-in']);
  }

  goToSignUp(): void {
    this.router.navigate(['/sign-up']);
  }
}
