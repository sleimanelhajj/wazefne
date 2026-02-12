import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BookingStat } from '../../../models/bookings.model';

@Component({
  selector: 'app-booking-stats-cards',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stats-cards.component.html',
  styleUrls: ['./stats-cards.component.css'],
})
export class BookingStatsCardsComponent {
  @Input() stats: BookingStat[] = [];
}
