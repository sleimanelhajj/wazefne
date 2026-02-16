export interface User {
  id: string;
  firstName: string;
  lastName: string;
  profileImage: string;
  title: string;
  rating: number;
  reviewCount: number;
  skills: string[];
  hourlyRate: number;
  verified: boolean;
  category: string;
  availableToday: boolean;
  location: string;
}
