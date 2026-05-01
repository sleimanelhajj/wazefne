import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { JobService } from './job.service';

describe('JobService (HTTP unit test)', () => {
  let service: JobService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/jobs`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(JobService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads jobs with category and location filters', () => {
    service.getJobs('Photography', 'Jounieh').subscribe((response) => {
      expect(response.success).toBe(true);
    });

    const req = httpMock.expectOne(
      (request) =>
        request.url === apiUrl &&
        request.params.get('category') === 'Photography' &&
        request.params.get('location') === 'Jounieh',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, jobs: [] });
  });

  it('does not send the location filter when location is all', () => {
    service.getJobs('Photography', 'all').subscribe();

    const req = httpMock.expectOne(
      (request) =>
        request.url === apiUrl &&
        request.params.get('category') === 'Photography' &&
        !request.params.has('location'),
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, jobs: [] });
  });

  it('creates a job with a POST request', () => {
    const payload = {
      title: 'Need a photographer',
      description: 'Event coverage',
      category: 'Photography',
      location: 'Jounieh',
      budget: 250,
    };

    service.createJob(payload).subscribe((response) => {
      expect(response.success).toBe(true);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, job: { id: 1 } });
  });

  it('updates a bid status with a PATCH request', () => {
    service.updateBidStatus(10, 22, 'accepted').subscribe((response) => {
      expect(response.conversationId).toBe(4);
    });

    const req = httpMock.expectOne(`${apiUrl}/10/bids/22/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'accepted' });
    req.flush({ success: true, status: 'accepted', conversationId: 4 });
  });
});
