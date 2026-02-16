export interface FilterCriteria {
  categories: string[];
  priceMin: number;
  priceMax: number;
  minRating: number;
  availableToday: boolean;
  location: string;
}
