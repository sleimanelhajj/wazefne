import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user-card.model';
import { UserCardComponent } from './user-card.component';

const user: User = {
  id: 'provider-1',
  firstName: 'Maya',
  lastName: 'Haddad',
  profileImage: '',
  title: 'Photographer',
  rating: 4.8,
  reviewCount: 12,
  skills: ['Portraits'],
  hourlyRate: 45,
  verified: true,
  category: 'Photography',
  availableToday: true,
  location: 'Jounieh',
  isFavorited: false,
};

describe('UserCardComponent (component test)', () => {
  let fixture: ComponentFixture<UserCardComponent>;
  let component: UserCardComponent;
  let router: { navigate: ReturnType<typeof vi.fn> };
  let authService: { getUserId: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    router = { navigate: vi.fn() };
    authService = { getUserId: vi.fn().mockReturnValue('current-user') };

    await TestBed.configureTestingModule({
      imports: [UserCardComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserCardComponent);
    component = fixture.componentInstance;
    component.user = { ...user };
    fixture.detectChanges();
  });

  it('formats the display name with a last-name initial', () => {
    expect(component.fullName).toBe('Maya H.');
  });

  it('navigates to the public profile for another user', () => {
    component.viewProfile();

    expect(router.navigate).toHaveBeenCalledWith(['/profile', 'provider-1']);
  });

  it('navigates to my profile when the card belongs to the current user', () => {
    authService.getUserId.mockReturnValue('provider-1');

    component.viewProfile();

    expect(router.navigate).toHaveBeenCalledWith(['/my-profile']);
  });

  it('emits the next favorite state and stops card navigation', () => {
    const emitted: unknown[] = [];
    const event = { stopPropagation: vi.fn() } as unknown as MouseEvent;
    component.favoriteToggle.subscribe((payload) => emitted.push(payload));

    component.onToggleFavorite(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(emitted).toEqual([{ userId: 'provider-1', makeFavorite: true }]);
  });
});
