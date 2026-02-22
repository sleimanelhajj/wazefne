import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { ProfileService } from '../../../services/profile.service';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-sidebar.component.html',
  styleUrls: ['./profile-sidebar.component.css'],
})
export class ProfileSidebarComponent {
  private readonly profileService = inject(ProfileService);

  @Input() hourlyRate: number = 0;
  @Input() isOwner = false;
  @Input() availableToday = false;
  @Output() profileUpdated = new EventEmitter<void>();

  toggling = false;

  toggleAvailability(): void {
    if (this.toggling) return;
    this.toggling = true;
    const newValue = !this.availableToday;

    this.profileService.updateProfile({ available_today: newValue }).subscribe({
      next: () => {
        this.availableToday = newValue;
        this.toggling = false;
        this.profileUpdated.emit();
      },
      error: () => {
        this.toggling = false;
      },
    });
  }
}
