import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-profile-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-sidebar.component.html',
  styleUrls: ['./profile-sidebar.component.css'],
})
export class ProfileSidebarComponent {
  @Input() hourlyRate: number = 0;
  @Input() isOwner = false;
}

