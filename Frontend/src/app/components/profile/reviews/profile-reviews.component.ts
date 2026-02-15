import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../../services/profile.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-profile-reviews',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-reviews.component.html',
  styleUrls: ['./profile-reviews.component.css'],
})
export class ProfileReviewsComponent {
  @Input() reviews: any[] = [];
  @Input() isOwner = false;
  @Input() profileUserId = '';
  @Output() reviewAdded = new EventEmitter<void>();

  private readonly profileService = inject(ProfileService);
  private readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  showModal = false;
  selectedRating = 0;
  hoverRating = 0;
  submitting = false;
  errorMessage = '';

  reviewForm: FormGroup = this.fb.group({
    comment: ['', [Validators.maxLength(500)]],
  });

  get isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  get reviewCount(): number {
    return this.reviews?.length || 0;
  }

  openModal(): void {
    if (!this.isAuthenticated) {
      this.errorMessage = 'Please log in to add a review';
      return;
    }
    this.showModal = true;
    this.selectedRating = 0;
    this.hoverRating = 0;
    this.reviewForm.reset();
    this.errorMessage = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.errorMessage = '';
  }

  selectRating(rating: number): void {
    this.selectedRating = rating;
  }

  setHoverRating(rating: number): void {
    this.hoverRating = rating;
  }

  clearHoverRating(): void {
    this.hoverRating = 0;
  }

  submitReview(): void {
    if (this.selectedRating === 0) {
      this.errorMessage = 'Please select a rating';
      return;
    }

    if (this.reviewForm.invalid) {
      this.errorMessage = 'Please check your input';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const reviewData = {
      reviewed_user_id: this.profileUserId,
      rating: this.selectedRating,
      comment: this.reviewForm.value.comment || undefined,
    };

    this.profileService.createReview(reviewData).subscribe({
      next: (response) => {
        if (response.success) {
          this.closeModal();
          this.reviewAdded.emit();
        } else {
          this.errorMessage = response.message || 'Failed to submit review';
        }
        this.submitting = false;
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Failed to submit review. Please try again.';
        this.submitting = false;
      },
    });
  }

  getStarArray(rating: number): boolean[] {
    return Array(5)
      .fill(false)
      .map((_, i) => i < rating);
  }

  getReviewerName(review: any): string {
    const { firstName, lastName } = review.reviewer || {};
    return [firstName, lastName].filter(Boolean).join(' ') || 'Anonymous';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
