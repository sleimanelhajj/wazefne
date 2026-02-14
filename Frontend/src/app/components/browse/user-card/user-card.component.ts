import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { User } from '../../../models/user-card.model';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-card.component.html',
  styleUrls: ['./user-card.component.css'],
})
export class UserCardComponent {
  private readonly router = inject(Router);

  @Input() user!: User;

  get fullName(): string {
    return `${this.user.firstName} ${this.user.lastName[0]}.`;
  }

  viewProfile(): void {
    this.router.navigate(['/profile', this.user.id]);
  }
}
