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
import { guestGuard } from './guards/guest.guard';
import { SsoCallbackComponent } from './pages/sso-callback/sso-callback';

export const routes: Routes = [
  { path: '', redirectTo: 'sign-in', pathMatch: 'full' },
  { path: 'sign-in', component: AuthComponent, canActivate: [guestGuard] },
  { path: 'sign-up', component: AuthComponent, canActivate: [guestGuard] },
  { path: 'sso-callback', component: SsoCallbackComponent },
  { path: 'home', component: HomeComponent },
  { path: 'setup-profile', component: SetupProfileComponent },
  { path: 'test', component: HomeHeroComponent },
  { path: 'browse', component: BrowseComponent, canActivate: [authGuard] },
  { path: 'profile/:id', component: ProfilePageComponent, canActivate: [authGuard] },
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
