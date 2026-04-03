import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { JobService } from '../../services/job.service';
import { Job, JobBid } from '../../models/job.model';
import { TopBarComponent } from '../../components/common/top-bar/top-bar.component';
import { BidModalComponent } from '../../components/jobs/bid-modal/bid-modal.component';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

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
  currentUserId = '';
  canManageBids = false;
  actingBidId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private chatService: ChatService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId() || '';
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
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load job', err);
        this.errorMsg = 'Failed to load job details.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  fetchBids(id: number): void {
    this.jobService.getJobBids(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.bids = res.bids;
          this.canManageBids = true;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 403) {
          this.canManageBids = false;
          this.bids = [];
        } else {
          console.error('Failed to load bids', err);
        }
        this.cdr.detectChanges();
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
    if (this.job?.id) {
      this.fetchBids(this.job.id);
    }
  }

  get isJobOwner(): boolean {
    return this.canManageBids;
  }

  onAcceptBid(bid: JobBid): void {
    if (!this.job || bid.status !== 'pending') return;
    this.actingBidId = bid.id;
    this.jobService.updateBidStatus(this.job.id, bid.id, 'accepted').subscribe({
      next: (res) => {
        this.bids = this.bids.map((b) => {
          if (b.id === bid.id) return { ...b, status: 'accepted' as const };
          if (b.status === 'pending') return { ...b, status: 'rejected' as const };
          return b;
        });
        this.actingBidId = null;
        if (res.conversationId) {
          this.router.navigate(['/messages'], { queryParams: { conversationId: res.conversationId } });
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to accept bid', err);
        this.actingBidId = null;
        this.cdr.detectChanges();
      },
    });
  }

  onRejectBid(bid: JobBid): void {
    if (!this.job || bid.status !== 'pending') return;
    this.actingBidId = bid.id;
    this.jobService.updateBidStatus(this.job.id, bid.id, 'rejected').subscribe({
      next: () => {
        this.bids = this.bids.map((b) => (b.id === bid.id ? { ...b, status: 'rejected' as const } : b));
        this.actingBidId = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to reject bid', err);
        this.actingBidId = null;
        this.cdr.detectChanges();
      },
    });
  }

  onMessageBidder(bid: JobBid): void {
    this.chatService.createConversation(bid.freelancer_id).subscribe({
      next: (res) => {
        this.router.navigate(['/messages'], { queryParams: { conversationId: res.conversation.id } });
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to open conversation', err);
        this.cdr.detectChanges();
      },
    });
  }

  getBidStatusLabel(status: JobBid['status']): string {
    if (status === 'accepted') return 'Accepted';
    if (status === 'rejected') return 'Rejected';
    return 'Pending';
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
