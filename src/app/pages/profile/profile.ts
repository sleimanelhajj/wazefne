import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProfileBannerComponent } from '../../components/profile/banner/profile-banner.component';
import { ProfileAboutComponent } from '../../components/profile/about/profile-about.component';
import { ProfileSkillsLanguagesComponent } from '../../components/profile/skills-languages/profile-skills-languages.component';
import { ProfilePortfolioComponent } from '../../components/profile/portfolio/profile-portfolio.component';
import { ProfileReviewsComponent } from '../../components/profile/reviews/profile-reviews.component';
import { ProfileSidebarComponent } from '../../components/profile/sidebar/profile-sidebar.component';
import { TopBarComponent } from '../../components/top-bar/top-bar.component';
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
export class ProfilePageComponent {}

