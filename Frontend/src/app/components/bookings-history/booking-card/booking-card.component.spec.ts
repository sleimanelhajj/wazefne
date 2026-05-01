import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Booking } from '../../../models/bookings.model';
import { BookingCardComponent } from './booking-card.component';

interface EmittedBookingActions {
  cancel: number[];
  accept: number[];
  decline: number[];
  start: number[];
  chat: number[];
}

const makeBooking = (overrides: Partial<Booking> = {}): Booking => ({
  id: 7,
  conversationId: 44,
  senderId: 'client-1',
  recipientId: 'provider-1',
  title: 'Event photography',
  hourlyRate: 50,
  status: 'pending',
  createdAt: '2026-05-01T10:00:00.000Z',
  sender: { firstName: 'Maya', lastName: 'Haddad', avatar: '' },
  recipient: { firstName: 'Karim', lastName: 'Nasser', avatar: '' },
  direction: 'i-booked',
  ...overrides,
});

describe('BookingCardComponent (component test)', () => {
  let fixture: ComponentFixture<BookingCardComponent>;
  let component: BookingCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingCardComponent);
    component = fixture.componentInstance;
  });

  it('shows cancel and message actions for bookings I sent while pending', () => {
    component.booking = makeBooking({ direction: 'i-booked', status: 'pending' });
    fixture.detectChanges();

    expect(component.actions.map((action) => action.action)).toEqual(['cancel', 'message']);
    expect(component.otherUserName).toBe('Karim Nasser');
    expect(component.statusLabel).toBe('Pending');
  });

  it('shows accept and decline actions for pending bookings sent to me', () => {
    component.booking = makeBooking({ direction: 'booked-me', status: 'pending' });
    fixture.detectChanges();

    expect(component.actions.map((action) => action.action)).toEqual(['accept', 'decline']);
    expect(component.otherUserName).toBe('Maya Haddad');
  });

  it('emits the correct booking events for actions', () => {
    const emitted: EmittedBookingActions = {
      cancel: [],
      accept: [],
      decline: [],
      start: [],
      chat: [],
    };

    component.booking = makeBooking({ direction: 'booked-me', status: 'accepted' });
    component.cancel.subscribe((id) => emitted.cancel.push(id));
    component.accept.subscribe((id) => emitted.accept.push(id));
    component.decline.subscribe((id) => emitted.decline.push(id));
    component.startProgress.subscribe((id) => emitted.start.push(id));
    component.openChat.subscribe((id) => emitted.chat.push(id));

    component.onAction('accept');
    component.onAction('decline');
    component.onAction('start');
    component.onAction('message');

    expect(emitted.accept).toEqual([7]);
    expect(emitted.decline).toEqual([7]);
    expect(emitted.start).toEqual([7]);
    expect(emitted.chat).toEqual([44]);
  });

  it('opens and confirms the done modal before emitting markDone', () => {
    const completed: number[] = [];
    component.booking = makeBooking({ direction: 'booked-me', status: 'in_progress' });
    component.markDone.subscribe((id) => completed.push(id));

    component.onAction('done');
    expect(component.showDoneModal).toBe(true);

    component.confirmDone();
    expect(component.showDoneModal).toBe(false);
    expect(completed).toEqual([7]);
  });
});
