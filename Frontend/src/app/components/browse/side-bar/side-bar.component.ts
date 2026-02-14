import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { categoryOptions } from './category-data';
import { FilterService } from '../../../services/filter.service';
import { User } from '../../../models/user-card.model';

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
    if (!this.categories.find((c) => c.label === this.selectedCategory)) {
      this.selectedCategory = this.categories.length > 0 ? this.categories[0].label : '';
    }

    this.emitFilters();
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
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
    });
  }
}
