import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { CvAnalyzerService } from './cv-analyzer.service';

describe('CvAnalyzerService (HTTP unit test)', () => {
  let service: CvAnalyzerService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/cv`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CvAnalyzerService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('submits a CV file and trims optional text fields', () => {
    const file = new File(['cv'], 'maya-cv.pdf', { type: 'application/pdf' });

    service.analyzeCv(file, '  Product Designer  ', '  Portfolio role  ').subscribe((response) => {
      expect(response.success).toBe(true);
      expect(response.overallScore).toBe(82);
    });

    const req = httpMock.expectOne(`${apiUrl}/analyze`);
    const body = req.request.body as FormData;

    expect(req.request.method).toBe('POST');
    expect(body.get('cv')).toBe(file);
    expect(body.get('targetRole')).toBe('Product Designer');
    expect(body.get('jobDescription')).toBe('Portfolio role');
    req.flush({ success: true, overallScore: 82 });
  });

  it('loads analysis history with the requested limit', () => {
    service.getMyAnalyses(5).subscribe((response) => {
      expect(response.success).toBe(true);
      expect(response.analyses).toEqual([]);
    });

    const req = httpMock.expectOne(
      (request) => request.url === `${apiUrl}/my-analyses` && request.params.get('limit') === '5',
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, analyses: [] });
  });
});
