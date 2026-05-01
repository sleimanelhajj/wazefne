import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { JobService } from '../../../services/job.service';
import { PostJobModalComponent } from './post-job-modal.component';

describe('PostJobModalComponent (component test)', () => {
  let fixture: ComponentFixture<PostJobModalComponent>;
  let component: PostJobModalComponent;
  let jobService: { createJob: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    jobService = { createJob: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [PostJobModalComponent],
      providers: [{ provide: JobService, useValue: jobService }],
    }).compileComponents();

    fixture = TestBed.createComponent(PostJobModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sets default category and location on init', () => {
    expect(component.category).toBeTruthy();
    expect(component.location).toBeTruthy();
  });

  it('shows a validation error when required fields are missing', () => {
    component.title = '';
    component.description = '';

    component.submitJob();

    expect(component.errorMsg).toBe('Please fill out all required fields.');
    expect(jobService.createJob).not.toHaveBeenCalled();
  });

  it('submits a trimmed job and emits the created job', () => {
    const emitted: unknown[] = [];
    const job = {
      id: 10,
      client_id: 'client-1',
      title: 'Need a chef',
      description: 'Dinner event',
      category: component.category,
      location: component.location,
      budget: 300,
      status: 'open',
      created_at: new Date(),
      updated_at: new Date(),
    };
    jobService.createJob.mockReturnValue(of({ success: true, job }));
    component.jobCreated.subscribe((createdJob) => emitted.push(createdJob));
    component.title = '  Need a chef  ';
    component.description = '  Dinner event  ';
    component.budget = 300;

    component.submitJob();

    expect(jobService.createJob).toHaveBeenCalledWith({
      title: 'Need a chef',
      description: 'Dinner event',
      category: component.category,
      location: component.location,
      budget: 300,
    });
    expect(component.isSubmitting).toBe(false);
    expect(emitted).toEqual([job]);
  });

  it('shows the backend error message when job creation fails', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    jobService.createJob.mockReturnValue(
      throwError(() => ({ error: { message: 'Category is required' } })),
    );
    component.title = 'Need a chef';
    component.description = 'Dinner event';

    component.submitJob();

    expect(component.isSubmitting).toBe(false);
    expect(component.errorMsg).toBe('Category is required');
  });
});
