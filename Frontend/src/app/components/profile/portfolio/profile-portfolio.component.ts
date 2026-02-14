import { CommonModule } from '@angular/common';
import { Component, Input, inject, ChangeDetectorRef } from '@angular/core';
import { ProfileService } from '../../../services/profile.service';

@Component({
  selector: 'app-profile-portfolio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-portfolio.component.html',
  styleUrls: ['./profile-portfolio.component.css'],
})
export class ProfilePortfolioComponent {
  private readonly profileService = inject(ProfileService);
  private readonly cdr = inject(ChangeDetectorRef);

  @Input() portfolio: { image_url: string; caption: string; sort_order: number }[] = [];
  @Input() isOwner = false;

  showGallery = false;
  uploading = false;

  openGallery(): void {
    this.showGallery = true;
  }

  closeGallery(): void {
    this.showGallery = false;
  }

  triggerUpload(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (event: any) => {
      const files: FileList = event.target.files;
      if (files.length > 0) {
        this.uploadFiles(files);
      }
    };
    input.click();
  }

  private uploadFiles(files: FileList): void {
    this.uploading = true;
    this.cdr.markForCheck();
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    this.profileService.uploadPortfolio(formData).subscribe({
      next: (res) => {
        if (res.success && res.images) {
          this.portfolio = [...this.portfolio, ...res.images];
        }
        this.uploading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.uploading = false;
        this.cdr.markForCheck();
      },
    });
  }
}

