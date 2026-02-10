import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { categoryOptions } from '../../side-bar/category-data';

@Component({
  selector: 'app-home-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
})
export class HomeCategoriesComponent {
  private readonly minMarqueeItems = 10;
  readonly categories = categoryOptions;
  readonly marqueeCategories = this.buildMarqueeCategories();

  trackByIndex(index: number): number {
    return index;
  }

  private buildMarqueeCategories(): string[] {
    if (this.categories.length === 0) {
      return [];
    }

    const targetCount = Math.max(this.categories.length, this.minMarqueeItems);
    const result: string[] = [];

    while (result.length < targetCount) {
      result.push(...this.categories);
    }

    return result.slice(0, targetCount);
  }

  getInitials(category: string): string {
    return category
      .split(' ')
      .filter((part) => part.length > 0)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
}
