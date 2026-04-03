import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { UserProfile } from '../../../models/profile.model';
import { ProfileService } from '../../../services/profile.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-banner.component.html',
  styleUrls: ['./profile-banner.component.css'],
})
export class ProfileBannerComponent implements OnInit, OnDestroy {
  @Input() user: UserProfile | null = null;
  @Input() isOwner = false;
  @Output() profileUpdated = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('coverFileInput') coverFileInput!: ElementRef<HTMLInputElement>;

  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);
  private authImgSub?: Subscription;

  readonly defaultCover =
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80';

  uploading = false;
  uploadingCover = false;
  errorMessage = '';

  // Local synced image for the owner
  ownerStoredImage: string | null = null;

  ngOnInit() {
    this.authImgSub = this.authService.profileImage$.subscribe((img) => {
      this.ownerStoredImage = img;
    });
  }

  ngOnDestroy() {
    this.authImgSub?.unsubscribe();
  }

  get coverImageSrc(): string {
    return this.user?.cover_image || this.defaultCover;
  }

  get avatarImageSrc(): string {
    // If owner, prefer the locally synced image for instant updates.
    // Otherwise rely on the database's profile_image or the default.
    if (this.isOwner && this.ownerStoredImage) {
      return this.ownerStoredImage;
    }
    return this.user?.profile_image || 'assets/icons/profile.svg';
  }

  // ── Profile picture upload ──

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
          // Update local storage and the observable
          this.authService.saveProfileImage(response.user.profileImage);
          // Emit event to refresh profile data if needed
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

  // ── Cover image upload ──

  openCoverFileSelector(): void {
    if (this.uploadingCover) return;
    this.coverFileInput.nativeElement.click();
  }

  onCoverFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      this.errorMessage = 'Please select a valid image file (JPG, PNG, GIF, WEBP)';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'Image size must be less than 5MB';
      return;
    }

    this.uploadCoverImage(file);
  }

  private uploadCoverImage(file: File): void {
    this.uploadingCover = true;
    this.errorMessage = '';

    const formData = new FormData();
    formData.append('image', file);

    this.profileService.uploadCoverImage(formData).subscribe({
      next: (response) => {
        if (response.success) {
          this.profileUpdated.emit();
        }
        this.uploadingCover = false;
        this.coverFileInput.nativeElement.value = '';
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Failed to upload cover image. Please try again.';
        this.uploadingCover = false;
        this.coverFileInput.nativeElement.value = '';
      },
    });
  }
}
