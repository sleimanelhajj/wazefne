import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LocationService } from './location.service';

describe('LocationService (unit test)', () => {
  afterEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: undefined,
    });
  });

  it('restores the cached detected location from localStorage', () => {
    localStorage.setItem('user_detected_location', 'Jounieh');

    TestBed.configureTestingModule({});
    const service = TestBed.inject(LocationService);

    expect(service.getCurrentLocation()).toBe('Jounieh');
  });

  it('clears the cached detected location', () => {
    localStorage.setItem('user_detected_location', 'Tripoli');
    TestBed.configureTestingModule({});
    const service = TestBed.inject(LocationService);

    service.clearLocation();

    expect(service.getCurrentLocation()).toBeNull();
    expect(localStorage.getItem('user_detected_location')).toBeNull();
  });

  it('maps browser coordinates to the nearest supported location', () => {
    const getCurrentPosition = vi.fn((success: PositionCallback) => {
      success({
        coords: {
          latitude: 33.9808,
          longitude: 35.6178,
        },
      } as GeolocationPosition);
    });

    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: { getCurrentPosition },
    });

    TestBed.configureTestingModule({});
    const service = TestBed.inject(LocationService);

    service.detectCurrentLocation();

    expect(getCurrentPosition).toHaveBeenCalled();
    expect(service.getCurrentLocation()).toBe('Jounieh');
    expect(localStorage.getItem('user_detected_location')).toBe('Jounieh');
  });
});
