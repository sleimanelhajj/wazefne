import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.css'],
  imports: [ReactiveFormsModule],
  standalone: true,
})
export class TopBarComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  searchForm: FormGroup;
  constructor() {
    this.searchForm = this.fb.group({
      search: [''],
      location: ['Beirut'],
    });
  }

  ngOnInit(): void {
    this.searchForm.valueChanges.subscribe((value) => {
      console.log('Search form value changed:', value);
    });
  }

  onSubmit(): void {
    console.log('Search:', this.searchForm.value);
  }
}
