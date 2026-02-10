import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface CategoryOption {
  label: string;
  count: number;
  selected: boolean;
}

@Component({
  selector: 'app-side-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.css'],
})
export class SideBarComponent {
  categories: CategoryOption[] = [
    { label: 'Butlers', count: 124, selected: true },
    { label: 'Cleaning', count: 85, selected: false },
    { label: 'Drivers', count: 42, selected: false },
    { label: 'Bartenders', count: 18, selected: false },
  ];

  readonly priceFloor = 0;
  readonly priceCeiling = 120;
  selectedRating = 4;
  priceMin = 15;
  priceMax = 85;
  availabilityToday = true;

  toggleCategory(category: CategoryOption): void {
    category.selected = !category.selected;
  }

  clampPrices(): void {
    if (this.priceMin > this.priceMax) {
      [this.priceMin, this.priceMax] = [this.priceMax, this.priceMin];
    }
    this.priceMin = Math.max(this.priceFloor, Math.min(this.priceMin, this.priceCeiling));
    this.priceMax = Math.max(this.priceMin, Math.min(this.priceMax, this.priceCeiling));
  }

  toggleAvailability(): void {
    this.availabilityToday = !this.availabilityToday;
  }

  setRating(value: number): void {
    this.selectedRating = value;
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
}
