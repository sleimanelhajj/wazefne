import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { UserProfile } from '../../../models/profile.model';
import { ProfileService } from '../../../services/profile.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-banner.component.html',
  styleUrls: ['./profile-banner.component.css'],
})
export class ProfileBannerComponent {
  @Input() user: UserProfile | null = null;
  @Input() isOwner = false;
  @Output() profileUpdated = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);

  uploading = false;
  errorMessage = '';

  openFileSelector(): void {
    if (this.uploading) return;
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Please select a valid image file (JPG, PNG, GIF, WEBP)';
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'Image size must be less than 5MB';
      return;
    }

    this.uploadProfilePicture(file);
  }

  uploadProfilePicture(file: File): void {
    this.uploading = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('image', file);

    this.profileService.uploadProfilePicture(formData).subscribe({
      next: (response) => {
        if (response.success && response.user?.profileImage) {
          // Update local storage
          this.authService.saveProfileImage(response.user.profileImage);
          // Emit event to refresh profile
          this.profileUpdated.emit();
        }
        this.uploading = false;
        // Reset file input
        this.fileInput.nativeElement.value = '';
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to upload image. Please try again.';
        this.uploading = false;
        this.fileInput.nativeElement.value = '';
      },
    });
  }
}
