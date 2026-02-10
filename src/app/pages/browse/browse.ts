import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TopBarComponent } from '../../components/top-bar/top-bar.component';
import { SideBarComponent } from '../../components/side-bar/side-bar.component';
import { UserCardComponent } from '../../components/user-card/user-card.component';
import { User } from '../../models/user-card.model';
import { users } from './mock-users';
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
  allUsers: User[] = users;
  users: User[] = [];
  private filterSubscription?: Subscription;

  constructor(private filterService: FilterService) {}

  ngOnInit(): void {
    this.filterSubscription = this.filterService.filters$.subscribe((filters) => {
      this.applyFilters(filters);
    });
  }

  ngOnDestroy(): void {
    this.filterSubscription?.unsubscribe();
  }

  private applyFilters(filters: FilterCriteria): void {
    this.users = this.allUsers.filter((user) => {
      // Category filter
      const matchesCategory =
        filters.categories.length === 0 || filters.categories.includes(user.category);

      // Price filter
      const matchesPrice =
        user.hourlyRate >= filters.priceMin && user.hourlyRate <= filters.priceMax;

      // Rating filter
      const matchesRating = user.rating >= filters.minRating;

      // Availability filter
      const matchesAvailability = !filters.availableToday || user.availableToday;

      return matchesCategory && matchesPrice && matchesRating && matchesAvailability;
    });
  }
}
