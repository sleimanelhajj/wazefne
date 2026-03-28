import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { TopBarComponent } from '../../components/common/top-bar/top-bar.component';
import { SideBarComponent } from '../../components/browse/side-bar/side-bar.component';
import { UserCardComponent } from '../../components/browse/user-card/user-card.component';
import { User } from '../../models/user-card.model';
import { ProfileService } from '../../services/profile.service';
import { FilterService } from '../../services/filter.service';
import { FavoritesService } from '../../services/favorites.service';
import { Observable, Subscription } from 'rxjs';
import { FilterCriteria } from '../../models/filter-criteria.model';
@Component({
  selector: 'app-browse',
  templateUrl: './browse.html',
  styleUrls: ['./browse.css'],
  imports: [CommonModule, TopBarComponent, SideBarComponent, UserCardComponent],
  standalone: true,
})
export class BrowseComponent implements OnInit, OnDestroy {
  private readonly profileService = inject(ProfileService);
  private readonly filterService = inject(FilterService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly cdr = inject(ChangeDetectorRef);

  allUsers: User[] = [];
  users: User[] = [];
  loading = true;
  mobileFiltersOpen = false;
  private filterSubscription?: Subscription;

  ngOnInit(): void {
    // Fetch users from backend
    this.profileService.getUsers().subscribe({
      next: (res) => {
        if (res.success) {
          this.allUsers = res.users;
        }
        this.loading = false;
        // Apply current filters once data arrives
        this.applyFilters(this.filterService.getCurrentFilters());
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });

    // React to filter changes
    this.filterSubscription = this.filterService.filters$.subscribe((filters) => {
      this.applyFilters(filters);
    });
  }

  ngOnDestroy(): void {
    this.filterSubscription?.unsubscribe();
  }

  private applyFilters(filters: FilterCriteria): void {
    this.users = this.allUsers.filter((user) => {
      const matchesCategory =
        filters.categories.length === 0 || filters.categories.includes(user.category);
      const matchesPrice =
        user.hourlyRate >= filters.priceMin && user.hourlyRate <= filters.priceMax;
      const matchesRating = user.rating >= filters.minRating;
      const matchesLocation =
        filters.location === 'all' ||
        (user.location || '').toLowerCase().includes(filters.location.toLowerCase()) ||
        filters.location.toLowerCase().includes((user.location || '').toLowerCase());

      return matchesCategory && matchesPrice && matchesRating && matchesLocation;
    });
  }

  toggleMobileFilters(): void {
    this.mobileFiltersOpen = !this.mobileFiltersOpen;
    // Prevent body scroll when modal is open
    if (this.mobileFiltersOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  onFavoriteToggle(event: { userId: string; makeFavorite: boolean }): void {
    const request$: Observable<unknown> = event.makeFavorite
      ? this.favoritesService.addFavoriteUser(event.userId)
      : this.favoritesService.removeFavoriteUser(event.userId);

    request$.subscribe({
      next: () => {
        this.patchFavoriteState(event.userId, event.makeFavorite);
        this.cdr.markForCheck();
      },
      error: (err: unknown) => {
        console.error('Failed to update favorite state:', err);
      },
    });
  }

  private patchFavoriteState(userId: string, isFavorited: boolean): void {
    this.allUsers = this.allUsers.map((u) => (u.id === userId ? { ...u, isFavorited } : u));
    this.users = this.users.map((u) => (u.id === userId ? { ...u, isFavorited } : u));
  }
}
