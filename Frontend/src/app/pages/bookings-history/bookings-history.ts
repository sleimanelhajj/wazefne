import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { TopBarComponent } from '../../components/common/top-bar/top-bar.component';
import { BookingStatsCardsComponent } from '../../components/bookings-history/stats-cards/stats-cards.component';
import { BookingTabsComponent } from '../../components/bookings-history/booking-tabs/booking-tabs.component';
import { BookingCardComponent } from '../../components/bookings-history/booking-card/booking-card.component';
import { BookingHelpBannerComponent } from '../../components/bookings-history/help-banner/help-banner.component';
import { Booking, BookingStat, BookingTab } from '../../models/bookings.model';
import { OfferService } from '../../services/offer.service';
import { AuthService } from '../../services/auth.service';

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
export class BookingsHistoryComponent implements OnInit {
  private readonly offerService = inject(OfferService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  directionToggle: 'booked-me' | 'i-booked' = 'i-booked';
  activeStatusTab = 'active';
  allBookings: Booking[] = [];
  loading = true;
  currentUserId = '';

  statusTabs: BookingTab[] = [
    { key: 'active', label: 'Active' },
    { key: 'past', label: 'Past' },
  ];

  get stats(): BookingStat[] {
    const active = this.allBookings.filter(
      (b) => b.status === 'pending' || b.status === 'accepted' || b.status === 'in_progress',
    ).length;
    const completed = this.allBookings.filter((b) => b.status === 'completed').length;
    const totalSpend = this.allBookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + b.hourlyRate, 0);

    return [
      { icon: '📅', iconBg: '#eff6ff', label: 'Active', value: active },
      { icon: '✅', iconBg: '#f0fdf4', label: 'Completed', value: completed },
      { icon: '💰', iconBg: '#faf5ff', label: 'Total Earned', value: `$${totalSpend.toFixed(0)}` },
    ];
  }

  ngOnInit(): void {
    this.currentUserId = this.authService.getUserId() || '';
    this.loadBookings();
  }

  loadBookings(): void {
    this.loading = true;
    this.offerService.getMyBookings().subscribe({
      next: (res) => {
        this.allBookings = res.bookings.map((b: any) => ({
          ...b,
          direction: b.senderId === this.currentUserId ? 'i-booked' : 'booked-me',
        }));
        this.updateTabCounts();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load bookings:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private updateTabCounts(): void {
    const dirBookings = this.allBookings.filter((b) => b.direction === this.directionToggle);
    const activeCount = dirBookings.filter(
      (b) => b.status === 'pending' || b.status === 'accepted' || b.status === 'in_progress',
    ).length;
    const pastCount = dirBookings.filter(
      (b) => b.status === 'completed' || b.status === 'cancelled' || b.status === 'declined',
    ).length;

    this.statusTabs = [
      { key: 'active', label: 'Active', count: activeCount },
      { key: 'past', label: 'Past', count: pastCount },
    ];
  }

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
        return b.status === 'in_progress' || b.status === 'accepted' || b.status === 'pending';
      case 'past':
        return b.status === 'completed' || b.status === 'cancelled' || b.status === 'declined';
      default:
        return true;
    }
  }

  onDirectionChange(dir: 'booked-me' | 'i-booked'): void {
    this.directionToggle = dir;
    this.updateTabCounts();
  }

  onStatusTabChange(key: string): void {
    this.activeStatusTab = key;
  }

  // ── Booking actions ──────────────────────────────────

  onCancel(offerId: number): void {
    this.offerService.cancelOffer(offerId).subscribe({
      next: () => this.updateLocalStatus(offerId, 'cancelled'),
      error: (err) => console.error('Cancel failed:', err),
    });
  }

  onAccept(offerId: number): void {
    this.offerService.updateOfferStatus(offerId, 'accepted').subscribe({
      next: () => this.updateLocalStatus(offerId, 'accepted'),
      error: (err) => console.error('Accept failed:', err),
    });
  }

  onDecline(offerId: number): void {
    this.offerService.updateOfferStatus(offerId, 'declined').subscribe({
      next: () => this.updateLocalStatus(offerId, 'declined'),
      error: (err) => console.error('Decline failed:', err),
    });
  }

  onStartProgress(offerId: number): void {
    this.offerService.updateOfferStatus(offerId, 'in_progress').subscribe({
      next: () => this.updateLocalStatus(offerId, 'in_progress'),
      error: (err) => console.error('Start progress failed:', err),
    });
  }

  onMarkDone(offerId: number): void {
    this.offerService.updateOfferStatus(offerId, 'completed').subscribe({
      next: () => this.updateLocalStatus(offerId, 'completed'),
      error: (err) => console.error('Mark done failed:', err),
    });
  }

  onOpenChat(conversationId: number): void {
    this.router.navigate(['/messages'], {
      queryParams: { conversationId },
    });
  }

  private updateLocalStatus(offerId: number, status: Booking['status']): void {
    this.allBookings = this.allBookings.map((b) => (b.id === offerId ? { ...b, status } : b));
    this.updateTabCounts();
    this.cdr.detectChanges();
  }
}
