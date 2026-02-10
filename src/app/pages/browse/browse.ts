import { Component, OnInit } from '@angular/core';
import { TopBarComponent } from '../../components/top-bar/top-bar.component';
import { SideBarComponent } from "../../components/side-bar/side-bar.component";

@Component({
  selector: 'app-browse',
  templateUrl: './browse.html',
  styleUrls: ['./browse.css'],
  imports: [TopBarComponent, SideBarComponent],
  standalone: true,
})
export class BrowseComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
