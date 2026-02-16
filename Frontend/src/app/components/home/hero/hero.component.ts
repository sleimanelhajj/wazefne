import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { REGION_OPTIONS } from '../../../models/available-locations';

@Component({
  selector: 'app-home-hero',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css'],
})
export class HomeHeroComponent {
  searchQuery = '';
  selectedLocation = 'all';
  locations = REGION_OPTIONS;

  onSearch(): void {
    console.log('Search:', this.searchQuery, 'Location:', this.selectedLocation);
  }
}
