import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocationService {
  private readonly STORAGE_KEY = 'user_detected_location';

  private readonly locationSubject = new BehaviorSubject<string | null>(this.restoreLocation());

  /** Observable that emits the detected location name (or null) */
  readonly currentLocation$: Observable<string | null> = this.locationSubject.asObservable();

  // City-level coordinates for geolocation matching
  private readonly locationCoords: { value: string; lat: number; lng: number }[] = [
    // Beirut
    { value: 'Achrafieh, Beirut', lat: 33.8886, lng: 35.5128 },
    { value: 'Hamra, Beirut', lat: 33.8959, lng: 35.4831 },
    { value: 'Verdun, Beirut', lat: 33.8834, lng: 35.4797 },
    { value: 'Ras Beirut', lat: 33.9003, lng: 35.4766 },
    { value: 'Gemmayze, Beirut', lat: 33.8933, lng: 35.5102 },
    { value: 'Mar Mikhael, Beirut', lat: 33.8922, lng: 35.5162 },
    { value: 'Badaro, Beirut', lat: 33.8756, lng: 35.5101 },
    { value: 'Furn el Chebbak, Beirut', lat: 33.871, lng: 35.5239 },
    // Mount Lebanon
    { value: 'Jounieh', lat: 33.9808, lng: 35.6178 },
    { value: 'Byblos (Jbeil)', lat: 34.1236, lng: 35.6512 },
    { value: 'Baabda', lat: 33.8341, lng: 35.5444 },
    { value: 'Aley', lat: 33.8119, lng: 35.5962 },
    { value: 'Broummana', lat: 33.8784, lng: 35.6362 },
    { value: 'Antelias', lat: 33.9088, lng: 35.58 },
    { value: 'Dbayeh', lat: 33.9192, lng: 35.5644 },
    { value: 'Zouk Mosbeh', lat: 33.9589, lng: 35.601 },
    { value: 'Kaslik', lat: 33.9764, lng: 35.6175 },
    { value: 'Bikfaya', lat: 33.9333, lng: 35.6667 },
    { value: 'Rabieh', lat: 33.9013, lng: 35.5594 },
    { value: 'Mansourieh', lat: 33.8753, lng: 35.5633 },
    { value: 'Hazmieh', lat: 33.85, lng: 35.5389 },
    { value: 'Sin el Fil', lat: 33.8764, lng: 35.5317 },
    { value: 'Dekwaneh', lat: 33.8814, lng: 35.5436 },
    { value: 'Bourj Hammoud', lat: 33.8942, lng: 35.5342 },
    { value: 'Jal el Dib', lat: 33.9119, lng: 35.5589 },
    { value: 'Naccache', lat: 33.9186, lng: 35.5536 },
    { value: 'Chouf', lat: 33.6908, lng: 35.5667 },
    { value: 'Damour', lat: 33.7142, lng: 35.4556 },
    { value: 'Khaldeh', lat: 33.7875, lng: 35.4722 },
    { value: 'Aramoun', lat: 33.7922, lng: 35.4872 },
    // North
    { value: 'Tripoli', lat: 34.4367, lng: 35.8497 },
    { value: 'Ehden', lat: 34.3062, lng: 35.9869 },
    { value: 'Zgharta', lat: 34.3928, lng: 35.895 },
    { value: 'Batroun', lat: 34.2553, lng: 35.6586 },
    { value: 'Bcharre', lat: 34.2506, lng: 36.0128 },
    { value: 'Chekka', lat: 34.3153, lng: 35.7308 },
    { value: 'Akkar', lat: 34.5333, lng: 36.0833 },
    // South
    { value: 'Saida (Sidon)', lat: 33.5631, lng: 35.3756 },
    { value: 'Tyre (Sour)', lat: 33.2705, lng: 35.1964 },
    { value: 'Jezzine', lat: 33.5444, lng: 35.5844 },
    { value: 'Nabatieh', lat: 33.3775, lng: 35.4836 },
    { value: 'Bint Jbeil', lat: 33.1214, lng: 35.4328 },
    { value: 'Marjayoun', lat: 33.3617, lng: 35.5903 },
    // Bekaa
    { value: 'Zahle', lat: 33.8463, lng: 35.9019 },
    { value: 'Baalbek', lat: 34.0058, lng: 36.2181 },
    { value: 'Chtaura', lat: 33.8167, lng: 35.85 },
    { value: 'Aanjar', lat: 33.7275, lng: 35.9281 },
    { value: 'Rachaya', lat: 33.4981, lng: 35.8461 },
    { value: 'Hermel', lat: 34.3953, lng: 36.3861 },
  ];

  /**
   * Synchronously returns the current detected location (or null).
   */
  getCurrentLocation(): string | null {
    return this.locationSubject.value;
  }

  /**
   * Triggers browser geolocation, finds the nearest known location,
   * caches it in localStorage, and emits via the subject.
   */
  detectCurrentLocation(): void {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearest = this.findNearestLocation(latitude, longitude);
        localStorage.setItem(this.STORAGE_KEY, nearest);
        this.locationSubject.next(nearest);
      },
      (error) => {
        console.warn('Geolocation failed:', error.message);
      },
      { timeout: 10000 },
    );
  }

  /**
   * Clears the cached location (called on logout).
   */
  clearLocation(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.locationSubject.next(null);
  }

  private findNearestLocation(lat: number, lng: number): string {
    let nearest = 'Achrafieh, Beirut';
    let minDist = Infinity;
    for (const loc of this.locationCoords) {
      const dist = Math.pow(lat - loc.lat, 2) + Math.pow(lng - loc.lng, 2);
      if (dist < minDist) {
        minDist = dist;
        nearest = loc.value;
      }
    }
    return nearest;
  }

  private restoreLocation(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.STORAGE_KEY);
  }
}
