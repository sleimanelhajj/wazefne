import { Component, OnInit, OnDestroy, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { FilterService } from '../../../services/filter.service';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
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
  private readonly filterService = inject(FilterService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  private imgSub?: Subscription;
  private authSub?: Subscription;
  private searchSub?: Subscription;

  @Input() showSearch = false;

  searchForm: FormGroup;
  dropdownOpen = false;
  mobileMenuOpen = false;
  userProfileImage: string | null = null;
  isLoggingOut = false;
  isLoggedIn = false;

  constructor() {
    this.searchForm = this.fb.group({
      search: [''],
    });
  }

  ngOnInit(): void {
    if (this.showSearch) {
      this.searchSub = this.searchForm.get('search')!.valueChanges.pipe(
        debounceTime(250),
        distinctUntilChanged(),
      ).subscribe((query: string) => {
        this.filterService.updateFilters({ searchQuery: query?.trim() ?? '' });
      });
    }

    this.imgSub = this.authService.profileImage$.subscribe((img) => {
      this.userProfileImage = img;
      this.cdr.detectChanges();
    });

    this.authSub = this.authService.isSignedIn$.subscribe((signedIn) => {
      this.isLoggedIn = signedIn;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.imgSub?.unsubscribe();
    this.authSub?.unsubscribe();
    this.searchSub?.unsubscribe();
  }

  get userName(): string {
    return this.authService.getUserName() || 'User';
  }

  get searchValue(): string {
    return this.searchForm.get('search')?.value ?? '';
  }

  clearSearch(): void {
    this.searchForm.get('search')?.setValue('');
  }

  onSubmit(): void {
    const query = this.searchValue.trim();
    this.filterService.updateFilters({ searchQuery: query });
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
