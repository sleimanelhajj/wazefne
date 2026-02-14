import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';

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
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  searchForm: FormGroup;
  userName = '';
  userRole = '';
  dropdownOpen = false;

  constructor() {
    this.searchForm = this.fb.group({
      search: [''],
      location: ['Beirut'],
    });
  }

  ngOnInit(): void {
    this.searchForm.valueChanges.subscribe((value) => {
      console.log('Search form value changed:', value);
    });

    // Load user profile to display name
    if (this.authService.isAuthenticated()) {
      this.profileService.getMyProfile().subscribe({
        next: (res) => {
          if (res.success && res.user) {
            this.userName = res.user.name || res.user.email;
            this.userRole = res.user.title || '';
          }
          this.cdr.markForCheck();
        },
        error: () => {
          this.userName = 'User';
          this.cdr.markForCheck();
        },
      });
    }
  }

  get isLoggedIn(): boolean {
    return this.authService.isAuthenticated();
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
}
