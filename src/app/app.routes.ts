import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { BrowseComponent } from './pages/browse/browse';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: AuthComponent },
  { path: 'test', component: TopBarComponent },
  { path: 'browse', component: BrowseComponent },
];
