import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProcessComponent } from '../../components/home/process/process.component';
import { HomeCategoriesComponent } from '../../components/home/categories/categories.component';
import { CtaFooterComponent } from '../../components/home/cta-footer/cta-footer.component';
import { TopBarComponent } from '../../components/common/top-bar/top-bar.component';
import { HomeHeroComponent } from '../../components/home/hero/hero.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  imports: [
    CommonModule,
    TopBarComponent,
    HomeCategoriesComponent,
    ProcessComponent,
    CtaFooterComponent,
    HomeHeroComponent,
  ],
})
export class HomeComponent {
  constructor() {}

  ngOnInit(): void {}
}
