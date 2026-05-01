import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { FilterService } from '../../../services/filter.service';
import { LocationService } from '../../../services/location.service';
import { User } from '../../../models/user-card.model';
import { SideBarComponent } from './side-bar.component';

const users: User[] = [
  {
    id: 'provider-1',
    firstName: 'Maya',
    lastName: 'Haddad',
    profileImage: '',
    title: 'Photographer',
    rating: 5,
    reviewCount: 3,
    skills: ['Portraits'],
    hourlyRate: 90,
    verified: true,
    category: 'Photography',
    availableToday: true,
    location: 'Jounieh',
  },
  {
    id: 'provider-2',
    firstName: 'Omar',
    lastName: 'Salem',
    profileImage: '',
    title: 'IT Support',
    rating: 4,
    reviewCount: 9,
    skills: ['Networks'],
    hourlyRate: 150,
    verified: false,
    category: 'IT Support',
    availableToday: true,
    location: 'Tripoli',
  },
];

describe('SideBarComponent (component test)', () => {
  let fixture: ComponentFixture<SideBarComponent>;
  let component: SideBarComponent;
  let filterService: { updateFilters: ReturnType<typeof vi.fn> };
  let locationSubject: Subject<string | null>;

  beforeEach(async () => {
    filterService = { updateFilters: vi.fn() };
    locationSubject = new Subject<string | null>();

    await TestBed.configureTestingModule({
      imports: [SideBarComponent],
      providers: [
        provideNoopAnimations(),
        { provide: FilterService, useValue: filterService },
        {
          provide: LocationService,
          useValue: {
            getCurrentLocation: () => 'Jounieh',
            currentLocation$: locationSubject.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SideBarComponent);
    component = fixture.componentInstance;
    component.users = users;
    component.ngOnChanges({
      users: new SimpleChange(undefined, users, true),
    });
    fixture.detectChanges();
    filterService.updateFilters.mockClear();
  });

  it('builds category counts from the loaded users', () => {
    expect(component.categories).toEqual([
      { label: 'IT Support', count: 1, selected: false },
      { label: 'Photography', count: 1, selected: false },
    ]);
  });

  it('includes the detected location in the location options', () => {
    expect(component.locationOptions[1]).toEqual({
      value: 'Jounieh',
      label: 'Your Location (Jounieh)',
    });
  });

  it('emits selected category and rating filters', () => {
    component.selectCategory('Photography');
    component.setRating(4);

    expect(filterService.updateFilters).toHaveBeenLastCalledWith({
      categories: ['Photography'],
      priceMin: 0,
      priceMax: 150,
      minRating: 4,
      location: 'all',
    });
  });

  it('clamps and swaps invalid price ranges before emitting filters', () => {
    component.priceMin = 200;
    component.priceMax = 40;

    component.clampPrices();

    expect(component.priceMin).toBe(40);
    expect(component.priceMax).toBe(150);
    expect(filterService.updateFilters).toHaveBeenCalledWith({
      categories: [],
      priceMin: 40,
      priceMax: 150,
      minRating: 0,
      location: 'all',
    });
  });
});
