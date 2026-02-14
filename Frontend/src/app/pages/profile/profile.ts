import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProfileBannerComponent } from '../../components/profile/banner/profile-banner.component';
import { ProfileAboutComponent } from '../../components/profile/about/profile-about.component';
import { ProfileSkillsLanguagesComponent } from '../../components/profile/skills-languages/profile-skills-languages.component';
import { ProfilePortfolioComponent } from '../../components/profile/portfolio/profile-portfolio.component';
import { ProfileReviewsComponent } from '../../components/profile/reviews/profile-reviews.component';
import { ProfileSidebarComponent } from '../../components/profile/sidebar/profile-sidebar.component';
import { TopBarComponent } from '../../components/common/top-bar/top-bar.component';
import { ProfileService } from '../../services/profile.service';
import { UserProfile } from '../../models/profile.model';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [
    CommonModule,
    TopBarComponent,
    ProfileBannerComponent,
    ProfileAboutComponent,
    ProfileSkillsLanguagesComponent,
    ProfilePortfolioComponent,
    ProfileReviewsComponent,
    ProfileSidebarComponent,
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'],
})
export class ProfilePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly profileService = inject(ProfileService);
  private readonly cdr = inject(ChangeDetectorRef);

  user: UserProfile | null = null;
  isOwner = false;
  loading = true;

  ngOnInit(): void {
    this.isOwner = this.route.snapshot.data['isOwner'] === true;
    const userId = this.route.snapshot.paramMap.get('id');

    const profile$ = userId
      ? this.profileService.getProfileById(userId)
      : this.profileService.getMyProfile();

    profile$.subscribe({
      next: (res) => {
        if (res.success && res.user) {
          this.user = res.user;
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }
}
