import { TestBed } from '@angular/core/testing';
import { FilterService } from './filter.service';
import { FilterCriteria } from '../models/filter-criteria.model';

describe('FilterService (unit test)', () => {
  let service: FilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilterService);
  });

  it('starts with the default browse filters', () => {
    expect(service.getCurrentFilters()).toEqual({
      categories: [],
      priceMin: 0,
      priceMax: Number.MAX_SAFE_INTEGER,
      minRating: 0,
      location: 'all',
      searchQuery: '',
    });
  });

  it('merges partial filter updates without losing existing values', () => {
    service.updateFilters({ categories: ['Photography'], searchQuery: 'wedding' });
    service.updateFilters({ minRating: 4 });

    expect(service.getCurrentFilters()).toEqual({
      categories: ['Photography'],
      priceMin: 0,
      priceMax: Number.MAX_SAFE_INTEGER,
      minRating: 4,
      location: 'all',
      searchQuery: 'wedding',
    });
  });

  it('emits updated filters through filters$', () => {
    const emissions: FilterCriteria[] = [];
    const subscription = service.filters$.subscribe((filters) => emissions.push(filters));

    service.updateFilters({ location: 'Jounieh' });

    expect(emissions.at(-1)?.location).toBe('Jounieh');
    subscription.unsubscribe();
  });
});
