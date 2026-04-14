import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProfileService } from '../../../services/profile.service';
import { UserProfile } from '../../../models/profile.model';
import { categoryOptions } from '../../browse/side-bar/category-data';

@Component({
  selector: 'app-edit-profile-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './edit-profile-dialog.component.html',
  styleUrls: ['./edit-profile-dialog.component.css'],
})
export class EditProfileDialogComponent implements OnInit {
  form!: FormGroup;
  saving = false;
  errorMessage = '';

  skills: string[] = [];
  languages: string[] = [];
  skillInput = '';
  languageInput = '';

  readonly categories = categoryOptions;

  constructor(
    private readonly fb: FormBuilder,
    private readonly profileService: ProfileService,
    private readonly dialogRef: MatDialogRef<EditProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: UserProfile },
  ) {}

  ngOnInit(): void {
    const u = this.data.user;
    this.skills = [...(u.skills ?? [])];
    this.languages = [...(u.languages ?? [])];

    this.form = this.fb.group({
      first_name: [u.first_name ?? '', Validators.required],
      last_name: [u.last_name ?? '', Validators.required],
      title: [u.title ?? ''],
      location: [u.location ?? ''],
      about_me: [u.about_me ?? ''],
      offer_description: [u.offer_description ?? ''],
      hourly_rate: [u.hourly_rate ?? 0, [Validators.min(0)]],
      category: [u.category ?? ''],
    });
  }

  // ── Skills ──

  addSkill(): void {
    const skill = this.skillInput.trim();
    if (skill && !this.skills.includes(skill)) {
      this.skills.push(skill);
    }
    this.skillInput = '';
  }

  removeSkill(index: number): void {
    this.skills.splice(index, 1);
  }

  onSkillKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addSkill();
    }
  }

  // ── Languages ──

  addLanguage(): void {
    const lang = this.languageInput.trim();
    if (lang && !this.languages.includes(lang)) {
      this.languages.push(lang);
    }
    this.languageInput = '';
  }

  removeLanguage(index: number): void {
    this.languages.splice(index, 1);
  }

  onLanguageKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.addLanguage();
    }
  }

  // ── Save / Cancel ──

  save(): void {
    if (this.form.invalid || this.saving) return;
    this.saving = true;
    this.errorMessage = '';

    this.profileService
      .updateProfile({
        ...this.form.value,
        skills: this.skills,
        languages: this.languages,
      })
      .subscribe({
        next: () => {
          this.saving = false;
          this.dialogRef.close(true);
        },
        error: (err) => {
          this.saving = false;
          this.errorMessage = err?.error?.message ?? 'Failed to save changes. Please try again.';
        },
      });
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
