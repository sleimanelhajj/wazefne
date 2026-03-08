import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { categoryOptions } from './category-data';
import { FilterService } from '../../../services/filter.service';
import { LocationService } from '../../../services/location.service';
import { User } from '../../../models/user-card.model';
import { LOCATION_OPTIONS } from '../../../models/available-locations';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css'],
})
export class SideBarComponent implements OnInit, OnChanges, OnDestroy {
  private readonly filterService = inject(FilterService);
  private readonly locationService = inject(LocationService);
  private locationSub!: Subscription;

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
  locationOptions: { value: string; label: string }[] = [];

  ngOnInit(): void {
    // Build the initial dropdown options
    this.rebuildLocationOptions(this.locationService.getCurrentLocation());

    // Subscribe to location changes (e.g. detection completes after login)
    this.locationSub = this.locationService.currentLocation$.subscribe((loc) => {
      this.rebuildLocationOptions(loc);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['users']) {
      this.buildCategories();
    }
  }

  ngOnDestroy(): void {
    this.locationSub?.unsubscribe();
  }

  /**
   * If a detected location exists, it appears as the first real option.
   */
  private rebuildLocationOptions(detectedLocation: string | null): void {
    const options: { value: string; label: string }[] = [{ value: 'all', label: 'All Locations' }];

    if (detectedLocation) {
      options.push({ value: detectedLocation, label: `Your Location (${detectedLocation})` });
    }

    options.push(...LOCATION_OPTIONS.map((loc) => ({ value: loc, label: loc })));

    this.locationOptions = options;
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
    this.selectedLocation = location;
    this.emitFilters();
  }

  clampPrices(): void {
    if (this.priceMin > this.priceMax) {
      [this.priceMin, this.priceMax] = [this.priceMax, this.priceMin];
    }
    this.priceMin = Math.max(this.priceFloor, Math.min(this.priceMin, this.priceCeiling));
    this.priceMax = Math.max(this.priceMin, Math.min(this.priceMax, this.priceCeiling));
    this.emitFilters();
  }

  preventNegative(event: KeyboardEvent): void {
    if (event.key === '-' || event.key === 'e' || event.key === '+') {
      event.preventDefault();
    }
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
      location: this.selectedLocation,
    });
  }
}
