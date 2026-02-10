import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { FilterCriteria } from '../models/filter-criteria.model';

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  private filterSubject = new BehaviorSubject<FilterCriteria>({
    categories: [],
    priceMin: 0,
    priceMax: 120,
    minRating: 0,
    availableToday: false,
  });

  filters$: Observable<FilterCriteria> = this.filterSubject.asObservable();

  updateFilters(filters: Partial<FilterCriteria>): void {
    const currentFilters = this.filterSubject.value;
    this.filterSubject.next({ ...currentFilters, ...filters });
  }

  getCurrentFilters(): FilterCriteria {
    return this.filterSubject.value;
  }
}
