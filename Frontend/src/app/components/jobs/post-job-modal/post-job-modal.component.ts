import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../../services/job.service';
import { Job } from '../../../models/job.model';
import { categoryOptions } from '../../browse/side-bar/category-data';
import { LOCATION_OPTIONS } from '../../../models/available-locations';

@Component({
  selector: 'app-post-job-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-job-modal.component.html',
  styleUrls: ['./post-job-modal.component.css'],
})
export class PostJobModalComponent implements OnInit {
  @Output() closeModal = new EventEmitter<void>();
  @Output() jobCreated = new EventEmitter<Job>();

  title: string = '';
  description: string = '';
  budget: number | null = null;
  category: string = '';
  location: string = '';

  categories = categoryOptions;
  locations = LOCATION_OPTIONS;

  isSubmitting = false;
  errorMsg = '';

  constructor(private jobService: JobService) {}

  ngOnInit(): void {
    // defaults
    if (this.categories.length) this.category = this.categories[0];
    if (this.locations.length) this.location = this.locations[0];
  }

  close(): void {
    this.closeModal.emit();
  }

  submitJob(): void {
    if (!this.title.trim() || !this.description.trim() || !this.category || !this.location) {
      this.errorMsg = 'Please fill out all required fields.';
      return;
    }

    this.isSubmitting = true;
    this.errorMsg = '';

    const newJobData = {
      title: this.title.trim(),
      description: this.description.trim(),
      category: this.category,
      location: this.location,
      budget: this.budget || undefined,
    };

    this.jobService.createJob(newJobData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        if (res.success) {
          this.jobCreated.emit(res.job);
        } else {
          this.errorMsg = 'Failed to create job. Please try again.';
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Create job error', err);
        this.errorMsg = err.error?.message || 'Server error occurred.';
      },
    });
  }
}
