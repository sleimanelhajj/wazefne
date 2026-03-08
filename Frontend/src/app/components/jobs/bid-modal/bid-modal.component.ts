import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../../services/job.service';
import { JobBid } from '../../../models/job.model';

@Component({
  selector: 'app-bid-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bid-modal.component.html',
  styleUrls: ['./bid-modal.component.css'],
})
export class BidModalComponent {
  @Input() jobId!: number;
  @Output() closeModal = new EventEmitter<void>();
  @Output() bidSubmitted = new EventEmitter<JobBid>();

  proposal: string = '';
  proposed_rate: number | null = null;

  isSubmitting = false;
  errorMsg = '';

  constructor(private jobService: JobService) {}

  close(): void {
    this.closeModal.emit();
  }

  submitBid(): void {
    if (!this.proposal.trim() || !this.proposed_rate) {
      this.errorMsg = 'Please provide a proposal and an hourly rate.';
      return;
    }

    this.isSubmitting = true;
    this.errorMsg = '';

    const bidData = {
      proposal: this.proposal.trim(),
      proposed_rate: this.proposed_rate,
    };

    this.jobService.createBid(this.jobId, bidData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.bidSubmitted.emit(res.bid);
        } else {
          this.errorMsg = 'Failed to submit proposal. Please try again.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Bid error', err);
        this.errorMsg = err.error?.message || 'Server error occurred.';
      },
    });
  }
}
