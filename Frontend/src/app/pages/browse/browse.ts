import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { TopBarComponent } from '../../components/common/top-bar/top-bar.component';
import { SideBarComponent } from '../../components/browse/side-bar/side-bar.component';
import { UserCardComponent } from '../../components/browse/user-card/user-card.component';
import { User } from '../../models/user-card.model';
import { ProfileService } from '../../services/profile.service';
import { FilterService } from '../../services/filter.service';
import { Subscription } from 'rxjs';
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
  private readonly cdr = inject(ChangeDetectorRef);

  allUsers: User[] = [];
  users: User[] = [];
  loading = true;
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
      const matchesAvailability = !filters.availableToday || user.availableToday;

      return matchesCategory && matchesPrice && matchesRating && matchesAvailability;
    });
  }
}
