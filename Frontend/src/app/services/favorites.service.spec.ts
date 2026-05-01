import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { FavoritesService } from './favorites.service';

describe('FavoritesService (HTTP unit test)', () => {
  let service: FavoritesService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/api/favorites`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(FavoritesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads favorite users', () => {
    service.getFavoriteUsers().subscribe((response) => {
      expect(response.success).toBe(true);
      expect(response.users).toEqual([]);
    });

    const req = httpMock.expectOne(`${apiUrl}/users`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, users: [] });
  });

  it('adds a favorite user with a POST request', () => {
    service.addFavoriteUser('provider-1').subscribe((response) => {
      expect(response.added).toBe(true);
      expect(response.isFavorited).toBe(true);
    });

    const req = httpMock.expectOne(`${apiUrl}/users/provider-1`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush({ success: true, isFavorited: true, added: true });
  });

  it('removes a favorite user with a DELETE request', () => {
    service.removeFavoriteUser('provider-1').subscribe((response) => {
      expect(response.removed).toBe(true);
      expect(response.isFavorited).toBe(false);
    });

    const req = httpMock.expectOne(`${apiUrl}/users/provider-1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, isFavorited: false, removed: true });
  });
});
