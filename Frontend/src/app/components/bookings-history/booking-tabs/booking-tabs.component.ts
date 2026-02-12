import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BookingTab } from '../../../models/bookings.model';
    
@Component({
  selector: 'app-booking-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-tabs.component.html',
  styleUrls: ['./booking-tabs.component.css'],
})
export class BookingTabsComponent {
  @Input() tabs: BookingTab[] = [];
  @Input() activeTab = '';
  @Output() tabChange = new EventEmitter<string>();

  selectTab(key: string): void {
    this.tabChange.emit(key);
  }
}
