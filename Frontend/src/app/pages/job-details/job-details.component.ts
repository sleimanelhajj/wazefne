import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { JobService } from '../../services/job.service';
import { Job, JobBid } from '../../models/job.model';
import { TopBarComponent } from '../../components/common/top-bar/top-bar.component';
import { BidModalComponent } from '../../components/jobs/bid-modal/bid-modal.component';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TopBarComponent, BidModalComponent],
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css'],
})
export class JobDetailsComponent implements OnInit {
  job: Job | null = null;
  bids: JobBid[] = []; // Only populated if user is the client who posted it
  loading = true;
  errorMsg = '';
  showBidModal = false;

  // Ideally fetched from Auth/User service to determine actions
  currentUserId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
  ) {}

  ngOnInit(): void {
    // For now, let's pretend we have a way to get the current user ID
    // We will assume `userType` checks can govern the UI, but we'll fetch bids anyway and handle 403s
    this.route.paramMap.subscribe((params) => {
      const jobId = Number(params.get('id'));
      if (jobId) {
        this.fetchJobDetails(jobId);
      } else {
        this.router.navigate(['/jobs']);
      }
    });
  }

  fetchJobDetails(id: number): void {
    this.loading = true;
    this.jobService.getJobById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.job = res.job;
          // After fetching job, try fetching bids (will fail if not owner, which is fine)
          this.fetchBids(id);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load job', err);
        this.errorMsg = 'Failed to load job details.';
        this.loading = false;
      },
    });
  }

  fetchBids(id: number): void {
    this.jobService.getJobBids(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.bids = res.bids;
        }
      },
      error: (err) => {
        // 403 Forbidden is expected if the user isn't the job owner
        if (err.status !== 403) {
          console.error('Failed to load bids', err);
        }
      },
    });
  }

  openBidModal(): void {
    this.showBidModal = true;
  }

  closeBidModal(): void {
    this.showBidModal = false;
  }

  onBidSubmitted(bid: JobBid): void {
    this.closeBidModal();
    // Show success toast or feedback here
    alert('Bid submitted successfully!');
  }

  get isJobOwner(): boolean {
    // Needs actual auth logic; for now, we rely on the backend 403 to restrict bids data
    // Usually: return this.currentUserId === this.job?.client_id;
    return this.bids.length > 0;
  }

  getTimeAgo(dateInput: Date | string | undefined): string {
    if (!dateInput) return '';
    const diff = new Date().getTime() - new Date(dateInput).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }
}
