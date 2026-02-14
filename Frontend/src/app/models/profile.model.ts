export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  title?: string;
  offer_description?: string;
  location?: string;
  about_me?: string;
  hourly_rate?: number;
  profile_image?: string;
  category?: string;
  available_today?: boolean;
  skills?: string[];
  languages?: string[];
  portfolio?: { image_url: string; caption?: string }[];
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  name?: string;
  title: string;
  offer_description: string;
  location: string;
  about_me: string;
  hourly_rate: number;
  profile_image: string;
  category: string;
  available_today: boolean;
  rating: number;
  review_count: number;
  verified: boolean;
  skills: string[];
  languages: string[];
  portfolio: { image_url: string; caption: string; sort_order: number }[];
}

export interface ProfileResponse {
  success: boolean;
  user?: UserProfile;
  message?: string;
}
