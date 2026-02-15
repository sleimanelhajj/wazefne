export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
    profileImage?: string;
  };
}
