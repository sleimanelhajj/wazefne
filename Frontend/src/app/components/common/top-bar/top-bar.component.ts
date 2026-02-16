import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  standalone: true,
})
export class TopBarComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  @Input() showSearch = true;

  searchForm: FormGroup;
  dropdownOpen = false;
  profileImage: string | null = null;
  mobileMenuOpen = false;

  constructor() {
    this.searchForm = this.fb.group({
      search: [''],
    });
  }

  ngOnInit(): void {
    this.searchForm.valueChanges.subscribe((value) => {
      console.log('Search form value changed:', value);
    });
    console.log(this.authService.getProfileImage());
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
  }

  get userName(): string {
    return this.authService.getUserName() || 'User';
  }

  get userProfileImage(): string | null {
    return this.authService.getProfileImage();
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

  logout(): void {
    this.dropdownOpen = false;
    this.authService.logout();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  onSubmit(): void {
    console.log('Search:', this.searchForm.value);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (this.mobileMenuOpen) {
      this.dropdownOpen = false; // Close profile dropdown when opening mobile menu
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  goToBrowse(): void {
    this.mobileMenuOpen = false;
    this.router.navigate(['/browse']);
  }

  goToJobs(): void {
    this.mobileMenuOpen = false;
    this.router.navigate(['/jobs']);
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
