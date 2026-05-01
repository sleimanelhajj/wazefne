import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { ProfileService } from './profile.service';

describe('ProfileService (HTTP unit test)', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ProfileService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests browse users from the backend users endpoint', () => {
    service.getUsers().subscribe((response) => {
      expect(response.success).toBe(true);
      expect(response.users).toHaveLength(0);
    });

    const req = httpMock.expectOne(`${apiUrl}/users`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, users: [] });
  });

  it('updates the authenticated user profile with a PUT request', () => {
    const payload = {
      first_name: 'Maya',
      last_name: 'Haddad',
      skills: ['Photography'],
    };

    service.updateProfile(payload).subscribe((response) => {
      expect(response.success).toBe(true);
    });

    const req = httpMock.expectOne(`${apiUrl}/profile/update-profile`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, user: { id: 'user-1' } });
  });

  it('sends profile-picture uploads as form data', () => {
    const formData = new FormData();
    formData.append('image', new File(['avatar'], 'avatar.png', { type: 'image/png' }));

    service.uploadProfilePicture(formData).subscribe((response) => {
      expect(response.success).toBe(true);
    });

    const req = httpMock.expectOne(`${apiUrl}/profile/upload-profile-picture`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(formData);
    req.flush({ success: true });
  });
});
