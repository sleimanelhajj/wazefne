export interface Booking {
  id: number;
  avatar: string;
  name: string;
  rating?: number;
  service: string;
  status: 'in-progress' | 'confirmed' | 'pending' | 'completed' | 'cancelled';
  statusLabel: string;
  date: string;
  location: string;
  priceLabel: string;
  price: string;
  progress?: number;
  direction: 'booked-me' | 'i-booked';
}

export interface BookingAction {
  label: string;
  style: 'primary' | 'outline' | 'danger';
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
