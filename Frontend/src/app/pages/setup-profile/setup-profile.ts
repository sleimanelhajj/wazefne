import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-setup-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
  ],
  templateUrl: './setup-profile.html',
  styleUrl: './setup-profile.css',
})
export class SetupProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly separatorKeyCodes = [ENTER, COMMA] as const;

  skills: string[] = [];
  languages: string[] = [];
  portfolio: { image_url: string; caption: string }[] = [];
  saving = false;

  readonly profileForm = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    title: ['', Validators.required],
    offer_description: [''],
    location: ['', Validators.required],
    about_me: [''],
    hourly_rate: [null as number | null, [Validators.min(0)]],
  });

  // ── Skills chips ──────────────────────────────────────
  addSkill(event: any): void {
    const value = (event.value || '').trim();
    if (value && !this.skills.includes(value)) {
      this.skills.push(value);
    }
    if (event.input) {
      event.input.value = '';
    }
  }

  removeSkill(skill: string): void {
    this.skills = this.skills.filter((s) => s !== skill);
  }

  // ── Language chips ────────────────────────────────────
  addLanguage(event: any): void {
    const value = (event.value || '').trim();
    if (value && !this.languages.includes(value)) {
      this.languages.push(value);
    }
    if (event.input) {
      event.input.value = '';
    }
  }

  removeLanguage(lang: string): void {
    this.languages = this.languages.filter((l) => l !== lang);
  }

  // ── Portfolio ─────────────────────────────────────────
  addPortfolioItem(): void {
    this.portfolio.push({ image_url: '', caption: '' });
  }

  removePortfolioItem(index: number): void {
    this.portfolio.splice(index, 1);
  }

  // ── Submit ────────────────────────────────────────────
  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formVal = this.profileForm.value;

    // Filter out empty portfolio entries
    const validPortfolio = this.portfolio.filter((p) => p.image_url.trim());

    this.profileService
      .updateProfile({
        first_name: formVal.first_name || undefined,
        last_name: formVal.last_name || undefined,
        title: formVal.title || undefined,
        offer_description: formVal.offer_description || undefined,
        location: formVal.location || undefined,
        about_me: formVal.about_me || undefined,
        hourly_rate: formVal.hourly_rate ?? undefined,
        skills: this.skills.length ? this.skills : undefined,
        languages: this.languages.length ? this.languages : undefined,
        portfolio: validPortfolio.length ? validPortfolio : undefined,
      })
      .subscribe({
        next: () => {
          this.snackBar.open('Profile updated successfully!', 'Close', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.saving = false;
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Profile update failed', err);
          this.snackBar.open('Failed to update profile. Please try again.', 'Close', {
            duration: 4000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
          });
          this.saving = false;
        },
      });
  }

  onSkip(): void {
    this.router.navigate(['/home']);
  }
}
