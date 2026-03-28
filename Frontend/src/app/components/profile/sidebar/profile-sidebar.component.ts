import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '../../../services/profile.service';
import { ChatService } from '../../../services/chat.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  templateUrl: './profile-sidebar.component.html',
  styleUrls: ['./profile-sidebar.component.css'],
})
export class ProfileSidebarComponent {
  private readonly profileService = inject(ProfileService);
  private readonly chatService = inject(ChatService);
  private readonly router = inject(Router);

  @Input() hourlyRate: number = 0;
  @Input() isOwner = false;
  @Input() availableToday = false;
  @Input() userId: string | number = 0;
  @Output() profileUpdated = new EventEmitter<void>();
  @Output() viewFavorites = new EventEmitter<void>();

  toggling = false;
  startingChat = false;

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

  startChat(): void {
    if (this.startingChat || !this.userId) return;
    this.startingChat = true;

    this.chatService.createConversation(String(this.userId)).subscribe({
      next: (res) => {
        console.log('Conversation created:', res);
        this.startingChat = false;
        this.router.navigate(['/messages']);
      },
      error: (err) => {
        console.error('Failed to create conversation:', err);
        this.startingChat = false;
      },
    });
  }
}
