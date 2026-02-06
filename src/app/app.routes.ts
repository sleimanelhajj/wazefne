import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: AuthComponent }
];
