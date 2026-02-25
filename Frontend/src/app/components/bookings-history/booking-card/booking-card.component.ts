import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Booking, BookingAction } from '../../../models/bookings.model';

@Component({
  selector: 'app-booking-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-card.component.html',
  styleUrls: ['./booking-card.component.css'],
})
export class BookingCardComponent {
  @Input() booking!: Booking;

  @Output() cancel = new EventEmitter<number>();
  @Output() accept = new EventEmitter<number>();
  @Output() decline = new EventEmitter<number>();
  @Output() startProgress = new EventEmitter<number>();
  @Output() markDone = new EventEmitter<number>();
  @Output() openChat = new EventEmitter<number>();

  showDoneModal = false;

  get otherUser() {
    return this.booking.direction === 'i-booked' ? this.booking.recipient : this.booking.sender;
  }

  get otherUserName(): string {
    const u = this.otherUser;
    return `${u.firstName} ${u.lastName}`.trim() || 'User';
  }

  get otherUserAvatar(): string {
    return this.otherUser.avatar || '';
  }

  get statusLabel(): string {
    switch (this.booking.status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Confirmed';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'declined':
        return 'Declined';
      case 'cancelled':
        return 'Cancelled';
      default:
        return this.booking.status;
    }
  }

  getStatusClass(): string {
    const status = this.booking.status === 'accepted' ? 'confirmed' : this.booking.status;
    return `status-${status}`;
  }

  get priceLabel(): string {
    return this.booking.status === 'completed' ? 'Total' : 'Rate';
  }

  get price(): string {
    return `$${this.booking.hourlyRate.toFixed(2)}/hr`;
  }

  get formattedDate(): string {
    const d = new Date(this.booking.createdAt);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  get actions(): BookingAction[] {
    const s = this.booking.status;
    const dir = this.booking.direction;

    if (dir === 'i-booked') {
      switch (s) {
        case 'pending':
          return [
            { label: 'Cancel', style: 'danger', action: 'cancel' },
            { label: 'Message', style: 'outline', action: 'message' },
          ];
        case 'accepted':
        case 'in_progress':
          return [{ label: 'Message', style: 'outline', action: 'message' }];
        default:
          return [];
      }
    } else {
      // booked-me
      switch (s) {
        case 'pending':
          return [
            { label: 'Accept', style: 'primary', action: 'accept' },
            { label: 'Decline', style: 'danger', action: 'decline' },
          ];
        case 'accepted':
          return [
            { label: 'Start Progress', style: 'success', action: 'start' },
            { label: 'Message', style: 'outline', action: 'message' },
          ];
        case 'in_progress':
          return [
            { label: 'Done', style: 'success', action: 'done' },
            { label: 'Message', style: 'outline', action: 'message' },
          ];
        default:
          return [];
      }
    }
  }

  onAction(action: string): void {
    switch (action) {
      case 'cancel':
        this.cancel.emit(this.booking.id);
        break;
      case 'accept':
        this.accept.emit(this.booking.id);
        break;
      case 'decline':
        this.decline.emit(this.booking.id);
        break;
      case 'start':
        this.startProgress.emit(this.booking.id);
        break;
      case 'done':
        this.showDoneModal = true;
        break;
      case 'message':
        this.openChat.emit(this.booking.conversationId);
        break;
    }
  }

  confirmDone(): void {
    this.showDoneModal = false;
    this.markDone.emit(this.booking.id);
  }

  cancelDone(): void {
    this.showDoneModal = false;
  }
}
