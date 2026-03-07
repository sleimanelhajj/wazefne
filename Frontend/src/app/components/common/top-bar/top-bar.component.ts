import { Component, OnInit, OnDestroy, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  standalone: true,
})
export class TopBarComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private imgSub?: Subscription;

  @Input() showSearch = true;

  searchForm: FormGroup;
  dropdownOpen = false;
  mobileMenuOpen = false;
  userProfileImage: string | null = null;
  isLoggingOut = false;
  isLoggedIn = false;

  private readonly cdr = inject(ChangeDetectorRef);
  private authSub?: Subscription;

  constructor() {
    this.searchForm = this.fb.group({
      search: [''],
    });
  }

  ngOnInit(): void {
    this.searchForm.valueChanges.subscribe((value) => {
      console.log('Search form value changed:', value);
    });

    // Reactively update the profile image when it changes
    this.imgSub = this.authService.profileImage$.subscribe((img) => {
      this.userProfileImage = img;
      this.cdr.detectChanges();
    });

    // Reactively update logged-in status
    this.authSub = this.authService.isSignedIn$.subscribe((signedIn) => {
      this.isLoggedIn = signedIn;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.imgSub?.unsubscribe();
    this.authSub?.unsubscribe();
  }

  get userName(): string {
    return this.authService.getUserName() || 'User';
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }

  goToProfile(): void {
    this.dropdownOpen = false;
    this.router.navigate(['/my-profile']);
  }

  async logout(): Promise<void> {
    this.dropdownOpen = false;
    this.mobileMenuOpen = false;
    this.isLoggingOut = true;
    try {
      await this.authService.logout();
    } finally {
      this.isLoggingOut = false;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/sign-in']);
  }

  onSubmit(): void {
    console.log('Search:', this.searchForm.value);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.dropdownOpen = false;
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  goToBrowse(): void {
    this.mobileMenuOpen = false;
    this.router.navigate(['/browse']);
  }

  goToBookings(): void {
    this.mobileMenuOpen = false;
    this.router.navigate(['/bookings']);
  }

  goToMessages(): void {
    this.mobileMenuOpen = false;
    this.router.navigate(['/messages']);
  }
}
