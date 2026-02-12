import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TopBarComponent } from '../../components/top-bar/top-bar.component';
import { BookingStatsCardsComponent } from '../../components/bookings-history/stats-cards/stats-cards.component';
import { BookingTabsComponent } from '../../components/bookings-history/booking-tabs/booking-tabs.component';
import { BookingCardComponent } from '../../components/bookings-history/booking-card/booking-card.component';
import { BookingHelpBannerComponent } from '../../components/bookings-history/help-banner/help-banner.component';
import { Booking, BookingStat, BookingTab } from '../../models/bookings.model';
@Component({
  selector: 'app-bookings-history',
  standalone: true,
  imports: [
    CommonModule,
    TopBarComponent,
    BookingStatsCardsComponent,
    BookingTabsComponent,
    BookingCardComponent,
    BookingHelpBannerComponent,
  ],
  templateUrl: './bookings-history.html',
  styleUrls: ['./bookings-history.css'],
})
export class BookingsHistoryComponent {
  directionToggle: 'booked-me' | 'i-booked' = 'i-booked';

  stats: BookingStat[] = [
    {
      icon: '📅',
      iconBg: '#eff6ff',
      label: 'Upcoming',
      value: 3,
    },
    {
      icon: '✅',
      iconBg: '#f0fdf4',
      label: 'Completed',
      value: 12,
    },
    {
      icon: '💰',
      iconBg: '#faf5ff',
      label: 'Total Spend',
      value: '$1,240',
    },
  ];

  statusTabs: BookingTab[] = [
    { key: 'active', label: 'Active', count: 3 },
    { key: 'past', label: 'Past' },
  ];

  activeStatusTab = 'active';

  allBookings: Booking[] = [
    {
      id: 1,
      avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
      name: 'Fadi the Plumber',
      rating: 4.9,
      service: 'Emergency Pipe Repair',
      status: 'in-progress',
      statusLabel: 'In Progress',
      date: 'Today, 10:00 AM',
      location: 'Achrafieh, Beirut',
      priceLabel: 'Total',
      price: '$45.00',
      progress: 65,
      direction: 'i-booked',
    },
    {
      id: 2,
      avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
      name: 'Sara (Event Butler)',
      rating: 5.0,
      service: 'Dinner Party Assistance',
      status: 'confirmed',
      statusLabel: 'Confirmed',
      date: 'Nov 02, 7:00 PM',
      location: 'Gemmayze, Beirut',
      priceLabel: 'Estimated',
      price: '$120.00',
      direction: 'i-booked',
    },
    {
      id: 3,
      avatar: '',
      name: 'Electrician Request',
      service: 'Faulty wiring checkup',
      status: 'pending',
      statusLabel: 'Pending',
      date: 'ASAP (Requested)',
      location: 'Hamra, Beirut',
      priceLabel: 'Budget',
      price: '$30 – $50',
      direction: 'i-booked',
    },
    {
      id: 4,
      avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
      name: 'Ahmad K.',
      rating: 4.7,
      service: 'Home Deep Cleaning',
      status: 'confirmed',
      statusLabel: 'Confirmed',
      date: 'Nov 05, 9:00 AM',
      location: 'Verdun, Beirut',
      priceLabel: 'Total',
      price: '$80.00',
      direction: 'booked-me',
    },
    {
      id: 5,
      avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
      name: 'Layla M.',
      rating: 4.8,
      service: 'Birthday Party Catering',
      status: 'in-progress',
      statusLabel: 'In Progress',
      date: 'Today, 5:00 PM',
      location: 'Jounieh',
      priceLabel: 'Total',
      price: '$200.00',
      progress: 40,
      direction: 'booked-me',
    },
    {
      id: 6,
      avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
      name: 'Hassan B.',
      service: 'Private Chef Service',
      status: 'completed',
      statusLabel: 'Completed',
      date: 'Oct 28, 7:00 PM',
      location: 'Rabieh',
      priceLabel: 'Total',
      price: '$150.00',
      direction: 'i-booked',
    },
    {
      id: 7,
      avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
      name: 'Hassan B.',
      service: 'Private Chef Service',
      status: 'completed',
      statusLabel: 'Completed',
      date: 'Oct 28, 7:00 PM',
      location: 'Rabieh',
      priceLabel: 'Total',
      price: '$150.00',
      direction: 'i-booked',
    },
    {
      id: 8,
      avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
      name: 'Hassan B.',
      service: 'Private Chef Service',
      status: 'completed',
      statusLabel: 'Completed',
      date: 'Oct 28, 7:00 PM',
      location: 'Rabieh',
      priceLabel: 'Total',
      price: '$150.00',
      direction: 'i-booked',
    },
    {
      id: 9,
      avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
      name: 'Hassan B.',
      service: 'Private Chef Service',
      status: 'completed',
      statusLabel: 'Completed',
      date: 'Oct 28, 7:00 PM',
      location: 'Rabieh',
      priceLabel: 'Total',
      price: '$150.00',
      direction: 'i-booked',
    },
    {
      id: 10,
      avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
      name: 'Hassan B.',
      service: 'Private Chef Service',
      status: 'completed',
      statusLabel: 'Completed',
      date: 'Oct 28, 7:00 PM',
      location: 'Rabieh',
      priceLabel: 'Total',
      price: '$150.00',
      direction: 'i-booked',
    },
    {
      id: 11,
      avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
      name: 'Hassan B.',
      service: 'Private Chef Service',
      status: 'completed',
      statusLabel: 'Completed',
      date: 'Oct 28, 7:00 PM',
      location: 'Rabieh',
      priceLabel: 'Total',
      price: '$150.00',
      direction: 'i-booked',
    },
  ];

  get filteredBookings(): Booking[] {
    return this.allBookings.filter((b) => {
      const matchesDirection = b.direction === this.directionToggle;
      const matchesStatus = this.matchesStatusTab(b);
      return matchesDirection && matchesStatus;
    });
  }

  private matchesStatusTab(b: Booking): boolean {
    switch (this.activeStatusTab) {
      case 'active':
        return b.status === 'in-progress' || b.status === 'confirmed' || b.status === 'pending';
      case 'past':
        return b.status === 'completed';
      case 'cancelled':
        return b.status === 'cancelled';
      default:
        return true;
    }
  }

  onDirectionChange(dir: 'booked-me' | 'i-booked'): void {
    this.directionToggle = dir;
  }

  onStatusTabChange(key: string): void {
    this.activeStatusTab = key;
  }
}
