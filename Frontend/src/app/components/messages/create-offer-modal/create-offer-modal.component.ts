import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-offer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-offer-modal.component.html',
  styleUrls: ['./create-offer-modal.component.css'],
})
export class CreateOfferModalComponent {
  @Input() recipientName = '';
  @Input() recipientHourlyRate = 0;
  @Input() recipientAvatar = '';

  @Output() submitOffer = new EventEmitter<{ title: string; hourlyRate: number }>();
  @Output() close = new EventEmitter<void>();

  jobTitle = '';
  proposedRate: number | null = null;
  submitting = false;

  ngOnInit() {
    this.proposedRate = this.recipientHourlyRate || null;
  }

  get isValid(): boolean {
    return this.jobTitle.trim().length > 0 && !!this.proposedRate && this.proposedRate > 0;
  }

  onSubmit() {
    if (!this.isValid || this.submitting) return;
    this.submitting = true;
    this.submitOffer.emit({
      title: this.jobTitle.trim(),
      hourlyRate: this.proposedRate!,
    });
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close.emit();
    }
  }
}
