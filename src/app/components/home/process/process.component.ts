import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface ProcessStep {
  title: string;
  description: string;
}

@Component({
  selector: 'app-home-process',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.css'],
})
export class ProcessComponent {
  readonly clientSteps: ProcessStep[] = [
    {
      title: 'Search for a service',
      description: 'Browse thousands of services or search for exactly what you need.',
    },
    {
      title: 'Compare professionals',
      description: 'Check reviews, ratings, and portfolios to find the perfect match.',
    },
    {
      title: 'Hire securely',
      description: 'Book your service and pay securely through our platform.',
    },
  ];

  readonly providerSteps: ProcessStep[] = [
    {
      title: 'Create your profile',
      description: 'Highlight your skills, experience, and past work to attract clients.',
    },
    {
      title: 'Receive job requests',
      description: 'Get notified when clients are looking for your specific skills.',
    },
    {
      title: 'Get paid fast',
      description: 'Complete the job and receive payments directly to your account.',
    },
  ];
}
