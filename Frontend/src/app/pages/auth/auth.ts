import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ClerkSignInComponent, ClerkSignUpComponent } from 'ngx-clerk';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ClerkSignInComponent, ClerkSignUpComponent],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class AuthComponent implements OnInit {
  private readonly router = inject(Router);

  protected isSignUp = false;

  ngOnInit(): void {
    const path = this.router.url;
    this.isSignUp = path.includes('sign-up');

    // If already signed in on the sign-in page, redirect to browse.
    // On sign-up, let Clerk's fallbackRedirectUrl handle the redirect to /setup-profile.
    if (window.Clerk?.user && !this.isSignUp) {
      this.router.navigate(['/browse']);
    }
  }
}
