import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UserCardComponent } from '../../browse/user-card/user-card.component';
import { FavoritesService } from '../../../services/favorites.service';
import { User } from '../../../models/user-card.model';

@Component({
  selector: 'app-favorite-users-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    UserCardComponent,
  ],
  templateUrl: './favorite-users-dialog.component.html',
  styleUrls: ['./favorite-users-dialog.component.css'],
})
export class FavoriteUsersDialogComponent implements OnInit {
  private readonly favoritesService = inject(FavoritesService);
  private readonly cdr = inject(ChangeDetectorRef);

  favoriteUsers: User[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    this.favoritesService.getFavoriteUsers().subscribe({
      next: (res) => {
        this.favoriteUsers = (res.users || []).map((u) => ({ ...u, isFavorited: true }));
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Failed to load favorites. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  onFavoriteToggle(event: { userId: string; makeFavorite: boolean }): void {
    if (event.makeFavorite) {
      this.favoritesService.addFavoriteUser(event.userId).subscribe({
        next: () => {
          this.favoriteUsers = this.favoriteUsers.map((u) =>
            u.id === event.userId ? { ...u, isFavorited: true } : u,
          );
          this.cdr.detectChanges();
        },
      });
      return;
    }

    this.favoritesService.removeFavoriteUser(event.userId).subscribe({
      next: () => {
        this.favoriteUsers = this.favoriteUsers.filter((u) => u.id !== event.userId);
        this.cdr.detectChanges();
      },
    });
  }

  trackByUserId(_index: number, user: User): string {
    return user.id;
  }
}
