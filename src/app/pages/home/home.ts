import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProcessComponent } from '../../components/home/process/process.component';
import { HomeCategoriesComponent } from '../../components/home/categories/categories.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  imports: [CommonModule, HomeCategoriesComponent, ProcessComponent],
})
export class HomeComponent {
  constructor() {}

  ngOnInit(): void {}
}
