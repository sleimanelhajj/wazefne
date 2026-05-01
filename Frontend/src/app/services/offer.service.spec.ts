import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { OfferService } from './offer.service';

describe('OfferService (HTTP unit test)', () => {
  let service: OfferService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/offers`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(OfferService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('creates an offer with the expected payload', () => {
    const payload = { conversationId: 3, title: 'Logo design', hourlyRate: 35 };

    service.createOffer(payload).subscribe((response) => {
      expect(response.success).toBe(true);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, offer: { id: 1 } });
  });

  it('updates offer status with a PATCH request', () => {
    service.updateOfferStatus(8, 'in_progress').subscribe((response) => {
      expect(response.status).toBe('in_progress');
    });

    const req = httpMock.expectOne(`${apiUrl}/8/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'in_progress' });
    req.flush({ success: true, status: 'in_progress' });
  });

  it('cancels an offer with an empty PATCH body', () => {
    service.cancelOffer(8).subscribe((response) => {
      expect(response.status).toBe('cancelled');
    });

    const req = httpMock.expectOne(`${apiUrl}/8/cancel`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({});
    req.flush({ success: true, status: 'cancelled' });
  });
});
