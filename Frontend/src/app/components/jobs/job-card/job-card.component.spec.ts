import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Job } from '../../../models/job.model';
import { JobCardComponent } from './job-card.component';

const makeJob = (createdAt: Date): Job => ({
  id: 3,
  client_id: 'client-1',
  title: 'Need a logo',
  description: 'Create a modern logo',
  budget: 200,
  category: 'Graphic Design',
  location: 'Jounieh',
  status: 'open',
  created_at: createdAt,
  updated_at: createdAt,
  client_first_name: 'Maya',
  client_last_name: 'Haddad',
});

describe('JobCardComponent (component test)', () => {
  let fixture: ComponentFixture<JobCardComponent>;
  let component: JobCardComponent;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-01T12:00:00.000Z'));

    await TestBed.configureTestingModule({
      imports: [JobCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(JobCardComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats recent jobs as hours ago', () => {
    component.job = makeJob(new Date('2026-05-01T10:00:00.000Z'));

    expect(component.timeAgo).toBe('2h ago');
  });

  it('formats older jobs as days ago', () => {
    component.job = makeJob(new Date('2026-04-29T12:00:00.000Z'));

    expect(component.timeAgo).toBe('2d ago');
  });

  it('emits the job when the proposal button is clicked', () => {
    const emittedJobs: Job[] = [];
    component.job = makeJob(new Date('2026-05-01T11:30:00.000Z'));
    component.bidClick.subscribe((job) => emittedJobs.push(job));
    fixture.detectChanges();

    fixture.debugElement.query(By.css('.bid-btn')).nativeElement.click();

    expect(emittedJobs).toEqual([component.job]);
  });
});
