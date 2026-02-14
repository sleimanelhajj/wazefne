import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth';
import { BrowseComponent } from './pages/browse/browse';
import { HomeComponent } from './pages/home/home';
import { HomeHeroComponent } from './components/home/hero/hero.component';
import { ProfilePageComponent } from './pages/profile/profile';
import { BookingsHistoryComponent } from './pages/bookings-history/bookings-history';
import { MessagesComponent } from './pages/messages/messages';
import { SetupProfileComponent } from './pages/setup-profile/setup-profile';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: AuthComponent },
  { path: 'home', component: HomeComponent },
  { path: 'setup-profile', component: SetupProfileComponent, canActivate: [authGuard] },
  { path: 'test', component: HomeHeroComponent },
  { path: 'browse', component: BrowseComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfilePageComponent, canActivate: [authGuard] },
  {
    path: 'my-profile',
    component: ProfilePageComponent,
    canActivate: [authGuard],
    data: { isOwner: true },
  },
  { path: 'bookings', component: BookingsHistoryComponent, canActivate: [authGuard] },
  { path: 'messages', component: MessagesComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'home' },
];
