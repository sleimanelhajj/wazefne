import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { categoryOptions } from './category-data';
import { FilterService } from '../../../services/filter.service';
import { users } from '../../../pages/browse/mock-users';

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css'],
})
export class SideBarComponent implements OnInit {
  categories: CategoryOption[] = [];
  selectedCategory: string = '';

  readonly priceFloor = 0;
  readonly priceCeiling = 120;
  selectedRating = 0;
  priceMin = 0;
  priceMax = 120;
  availabilityToday = false;

  constructor(private filterService: FilterService) {}

  ngOnInit(): void {
    // Calculate category counts from users
    const categoryCounts = new Map<string, number>();
    users.forEach((user) => {
      categoryCounts.set(user.category, (categoryCounts.get(user.category) || 0) + 1);
    });

    // Create category options with counts
    this.categories = categoryOptions
      .map((label) => ({
        label,
        count: categoryCounts.get(label) || 0,
        selected: false,
      }))
      .filter((cat) => cat.count > 0); // Only show categories with users

    // Set first category as selected by default
    if (this.categories.length > 0) {
      this.selectedCategory = this.categories[0].label;
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
