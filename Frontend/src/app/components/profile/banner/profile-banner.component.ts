import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { UserProfile } from '../../../models/profile.model';

@Component({
  selector: 'app-profile-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-banner.component.html',
  styleUrls: ['./profile-banner.component.css'],
})
export class ProfileBannerComponent {
  @Input() user: UserProfile | null = null;
  @Input() isOwner = false;
}

