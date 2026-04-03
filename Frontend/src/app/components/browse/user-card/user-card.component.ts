import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { User } from '../../../models/user-card.model';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css'],
})
export class UserCardComponent {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  @Input() user!: User;
  @Output() favoriteToggle = new EventEmitter<{ userId: string; makeFavorite: boolean }>();

  get fullName(): string {
    return `${this.user.firstName} ${this.user.lastName[0]}.`;
  }

  viewProfile(): void {
    const myId = this.authService.getUserId();
    if (myId && myId === this.user.id) {
      this.router.navigate(['/my-profile']);
    } else {
      this.router.navigate(['/profile', this.user.id]);
    }
  }

  onToggleFavorite(event: MouseEvent): void {
    event.stopPropagation();
    this.favoriteToggle.emit({
      userId: this.user.id,
      makeFavorite: !this.user.isFavorited,
    });
  }
}
