import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../services/job.service';
import { Job } from '../../models/job.model';
import { TopBarComponent } from '../../components/common/top-bar/top-bar.component';
import { JobCardComponent } from '../../components/jobs/job-card/job-card.component';
import { PostJobModalComponent } from '../../components/jobs/post-job-modal/post-job-modal.component';
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
    MatSelectModule,
    MatFormFieldModule,
  ],
  templateUrl: './jobs.component.html',
  styleUrls: ['./jobs.component.css'],
})
export class JobsComponent implements OnInit {
  jobs: Job[] = [];
  loading = true;
  userType = 'client'; // To be dynamically pulled from Auth service eventually
  showPostModal = false;

  categories = categoryOptions;
  locations = LOCATION_OPTIONS;

  selectedCategory = '';
  selectedLocation = '';

  constructor(
    private jobService: JobService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.fetchJobs();
  }

  fetchJobs(): void {
    this.loading = true;
    this.jobService.getJobs(this.selectedCategory, this.selectedLocation).subscribe({
      next: (res) => {
        if (res.success) {
          this.jobs = res.jobs;
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

  openPostModal(): void {
    this.showPostModal = true;
  }

  onFilterChange(): void {
    this.fetchJobs();
  }

  closePostModal(): void {
    this.showPostModal = false;
  }

  onJobPosted(newJob: Job): void {
    this.jobs.unshift(newJob);
    this.closePostModal();
  }
}
