export interface BookingUser {
  firstName: string;
  lastName: string;
  avatar: string;
}

export interface Booking {
  id: number;
  conversationId: number;
  senderId: string;
  recipientId: string;
  title: string;
  hourlyRate: number;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled' | 'in_progress' | 'completed';
  createdAt: string;
  sender: BookingUser;
  recipient: BookingUser;
  /** Computed on the frontend */
  direction: 'booked-me' | 'i-booked';
}

export interface BookingAction {
  label: string;
  style: 'primary' | 'outline' | 'danger' | 'success';
  action: string;
}

export interface BookingTab {
  key: string;
  label: string;
  count?: number;
}

export interface BookingStat {
  icon: string;
  iconBg: string;
  label: string;
  value: string | number;
}
