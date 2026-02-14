import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-profile-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-reviews.component.html',
  styleUrls: ['./profile-reviews.component.css'],
})
export class ProfileReviewsComponent {
  @Input() reviewCount = 0;
  @Input() isOwner = false;
  // TODO: Accept actual review data when review system is built
}

