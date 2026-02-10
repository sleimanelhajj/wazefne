import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth';
import { BrowseComponent } from './pages/browse/browse';
import { HomeCategoriesComponent } from './components/home/categories/categories.component';
import { ProcessComponent } from './components/home/process/process.component';
import { HomeComponent } from './pages/home/home';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: AuthComponent },
  { path: 'test', component: ProcessComponent },
  { path: 'browse', component: BrowseComponent },
  { path: 'home', component: HomeComponent },
];
