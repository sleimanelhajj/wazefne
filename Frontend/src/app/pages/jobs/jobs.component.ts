import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { JobService } from '../../services/job.service';
import { Job, JobBid } from '../../models/job.model';
import { TopBarComponent } from '../../components/common/top-bar/top-bar.component';
import { JobCardComponent } from '../../components/jobs/job-card/job-card.component';
import { PostJobModalComponent } from '../../components/jobs/post-job-modal/post-job-modal.component';
import { BidModalComponent } from '../../components/jobs/bid-modal/bid-modal.component';
import { categoryOptions } from '../../components/browse/side-bar/category-data';
import { LOCATION_OPTIONS } from '../../models/available-locations';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TopBarComponent,
    JobCardComponent,
    PostJobModalComponent,
    BidModalComponent,
    MatSelectModule,
    MatFormFieldModule,
    RouterModule,
  ],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css'],
})
export class JobsComponent implements OnInit {
  jobs: Job[] = [];
  myPostedJobs: Job[] = [];
  loading = true;
  loadingMyJobs = false;
  userType = 'client'; 
  showPostModal = false;
  showBidModal = false;
  selectedJobId: number | null = null;
  activeSection: 'browse' | 'offers' = 'browse';

  categories = categoryOptions;
  locations = LOCATION_OPTIONS;

  selectedCategory = '';
  selectedLocation = '';

  constructor(
    private jobService: JobService,
    private cdr: ChangeDetectorRef,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.fetchJobs();
  }

  fetchJobs(): void {
    this.loading = true;
    this.jobService.getJobs(this.selectedCategory, this.selectedLocation).subscribe({
      next: (res) => {
        if (res.success) {
          // Browse only jobs the user can actually bid on
          this.jobs = res.jobs.filter((j) => !j.is_owner);
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching jobs:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  fetchMyPostedJobs(): void {
    this.loadingMyJobs = true;
    this.jobService.getMyPostedJobs().subscribe({
      next: (res) => {
        if (res.success) {
          this.myPostedJobs = res.jobs;
        }
        this.loadingMyJobs = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching my posted jobs:', err);
        this.loadingMyJobs = false;
        this.cdr.detectChanges();
      },
    });
  }

  openPostModal(): void {
    this.showPostModal = true;
  }

  onFilterChange(): void {
    this.fetchJobs();
  }

  setSection(section: 'browse' | 'offers'): void {
    this.activeSection = section;
    if (section === 'offers') {
      this.fetchMyPostedJobs();
    }
  }

  closePostModal(): void {
    this.showPostModal = false;
  }

  onJobPosted(newJob: Job): void {
    const ownerJob = { ...newJob, is_owner: true };
    this.myPostedJobs.unshift(ownerJob);
    this.closePostModal();
    if (this.activeSection !== 'offers') {
      // Keep browse list strictly bid-able jobs (exclude own jobs)
      this.fetchJobs();
    }
  }

  openBidModal(job: Job): void {
    this.selectedJobId = job.id;
    this.showBidModal = true;
  }

  closeBidModal(): void {
    this.showBidModal = false;
    this.selectedJobId = null;
  }

  onBidSubmitted(_bid: JobBid): void {
    this.closeBidModal();
  }

  openJobOffers(jobId: number): void {
    this.router.navigate(['/jobs', jobId]);
  }

  getStatusLabel(status: Job['status']): string {
    switch (status) {
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Open';
    }
  }
}
