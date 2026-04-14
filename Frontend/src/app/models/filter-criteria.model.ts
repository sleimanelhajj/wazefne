export interface FilterCriteria {
  categories: string[];
  priceMin: number;
  priceMax: number;
  minRating: number;
  location: string;
  searchQuery: string;
}
