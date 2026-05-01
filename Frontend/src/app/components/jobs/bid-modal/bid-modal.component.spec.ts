import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { JobService } from '../../../services/job.service';
import { BidModalComponent } from './bid-modal.component';

describe('BidModalComponent (component test)', () => {
  let fixture: ComponentFixture<BidModalComponent>;
  let component: BidModalComponent;
  let jobService: { createBid: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    jobService = { createBid: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [BidModalComponent],
      providers: [{ provide: JobService, useValue: jobService }],
    }).compileComponents();

    fixture = TestBed.createComponent(BidModalComponent);
    component = fixture.componentInstance;
    component.jobId = 15;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a validation error when proposal or rate is missing', () => {
    component.proposal = '   ';
    component.proposed_rate = null;

    component.submitBid();

    expect(component.errorMsg).toBe('Please provide a proposal and an hourly rate.');
    expect(jobService.createBid).not.toHaveBeenCalled();
  });

  it('submits a trimmed bid and emits the created bid', () => {
    const emitted: unknown[] = [];
    const bid = {
      id: 1,
      job_id: 15,
      freelancer_id: 'provider-1',
      proposal: 'I can help',
      proposed_rate: 40,
      status: 'pending',
      created_at: new Date(),
    };
    jobService.createBid.mockReturnValue(of({ success: true, bid }));
    component.bidSubmitted.subscribe((createdBid) => emitted.push(createdBid));
    component.proposal = '  I can help  ';
    component.proposed_rate = 40;

    component.submitBid();

    expect(jobService.createBid).toHaveBeenCalledWith(15, {
      proposal: 'I can help',
      proposed_rate: 40,
    });
    expect(component.isSubmitting).toBe(false);
    expect(emitted).toEqual([bid]);
  });

  it('shows the backend error message when submission fails', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    jobService.createBid.mockReturnValue(
      throwError(() => ({ error: { message: 'Job is closed' } })),
    );
    component.proposal = 'I can help';
    component.proposed_rate = 40;

    component.submitBid();

    expect(component.isSubmitting).toBe(false);
    expect(component.errorMsg).toBe('Job is closed');
  });
});
