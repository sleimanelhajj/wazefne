import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
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

  getStatusClass(): string {
    return `status-${this.booking.status}`;
  }

  get actions(): BookingAction[] {
    switch (this.booking.status) {
      case 'in-progress':
      case 'confirmed':
        return [{ label: 'Message', style: 'outline' }];
      case 'pending':
        return [{ label: 'Cancel Request', style: 'danger' }];
      case 'completed':
        return [{ label: 'Leave Review', style: 'primary' }];
      case 'cancelled':
        return [];
      default:
        return [];
    }
  }
}
