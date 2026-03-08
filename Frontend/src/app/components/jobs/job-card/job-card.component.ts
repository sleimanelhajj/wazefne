import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Job } from '../../../models/job.model';

@Component({
  selector: 'app-job-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-card.component.html',
  styleUrls: ['./job-card.component.css'],
})
export class JobCardComponent {
  @Input() job!: Job;
  @Output() bidClick = new EventEmitter<Job>();

  onBidClick(): void {
    this.bidClick.emit(this.job);
  }

  get timeAgo(): string {
    if (!this.job.created_at) return '';
    const diff = new Date().getTime() - new Date(this.job.created_at).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }
}
