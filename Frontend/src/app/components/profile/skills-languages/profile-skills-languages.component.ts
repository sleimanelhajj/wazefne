import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-profile-skills-languages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile-skills-languages.component.html',
  styleUrls: ['./profile-skills-languages.component.css'],
})
export class ProfileSkillsLanguagesComponent {
  @Input() skills: string[] = [];
  @Input() languages: string[] = [];
}

