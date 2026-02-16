import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { categoryOptions } from './category-data';
import { FilterService } from '../../../services/filter.service';
import { User } from '../../../models/user-card.model';
import { REGION_OPTIONS, LOCATION_OPTIONS } from '../../../models/available-locations';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css'],
})
export class SideBarComponent implements OnChanges {
  private readonly filterService = inject(FilterService);

  @Input() users: User[] = [];

  categories: CategoryOption[] = [];
  selectedCategory: string = '';

  readonly priceFloor = 0;
  readonly priceCeiling = 120;
  selectedRating = 0;
  priceMin = 0;
  priceMax = 120;
  availabilityToday = false;

  // Location filter
  selectedLocation = 'all';
  detectingLocation = false;
  locationOptions = [
    { value: 'all', label: 'All Locations' },
    { value: 'current', label: '📍 Current Location' },
    ...LOCATION_OPTIONS.map((loc) => ({ value: loc, label: loc })),
  ];

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['users']) {
      this.buildCategories();
    }
  }

  private buildCategories(): void {
    const categoryCounts = new Map<string, number>();
    this.users.forEach((user) => {
      const count = categoryCounts.get(user.category) || 0;
      categoryCounts.set(user.category, count + 1);
    });

    this.categories = categoryOptions
      .map((label) => ({
        label,
        count: categoryCounts.get(label) || 0,
        selected: false,
      }))
      .filter((cat) => cat.count > 0);

    // Reset selection if current category no longer exists
    if (this.selectedCategory && !this.categories.find((c) => c.label === this.selectedCategory)) {
      this.selectedCategory = '';
    }

    this.emitFilters();
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.emitFilters();
  }

  selectLocation(location: string): void {
    if (location === 'current') {
      this.detectCurrentLocation();
    } else {
      this.selectedLocation = location;
      this.emitFilters();
    }
  }

  private detectCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.selectedLocation = 'all';
      this.emitFilters();
      return;
    }

    this.detectingLocation = true;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const nearest = this.findNearestLocation(latitude, longitude);
        this.selectedLocation = nearest;
        this.detectingLocation = false;

        // Update the dropdown to show the detected location
        const currentOption = this.locationOptions.find((o) => o.value === 'current');
        if (currentOption) {
          currentOption.label = `📍 ${nearest}`;
        }

        this.emitFilters();
      },
      () => {
        // On error, fall back to all
        this.selectedLocation = 'all';
        this.detectingLocation = false;
        this.emitFilters();
      },
      { timeout: 10000 },
    );
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

  clampPrices(): void {
    if (this.priceMin > this.priceMax) {
      [this.priceMin, this.priceMax] = [this.priceMax, this.priceMin];
    }
    this.priceMin = Math.max(this.priceFloor, Math.min(this.priceMin, this.priceCeiling));
    this.priceMax = Math.max(this.priceMin, Math.min(this.priceMax, this.priceCeiling));
    this.emitFilters();
  }

  toggleAvailability(): void {
    this.availabilityToday = !this.availabilityToday;
    this.emitFilters();
  }

  setRating(value: number): void {
    this.selectedRating = this.selectedRating === value ? 0 : value;
    this.emitFilters();
  }

  get priceFillStyle() {
    const minPercent = (this.priceMin / this.priceCeiling) * 100;
    const maxPercent = (this.priceMax / this.priceCeiling) * 100;
    return {
      left: `${minPercent}%`,
      width: `${Math.max(maxPercent - minPercent, 0)}%`,
    };
  }

  get starArray(): number[] {
    return Array.from({ length: 5 }, (_, index) => index + 1);
  }

  private emitFilters(): void {
    const selectedCategories = this.selectedCategory ? [this.selectedCategory] : [];

    this.filterService.updateFilters({
      categories: selectedCategories,
      priceMin: this.priceMin,
      priceMax: this.priceMax,
      minRating: this.selectedRating,
      availableToday: this.availabilityToday,
      location: this.selectedLocation,
    });
  }
}
