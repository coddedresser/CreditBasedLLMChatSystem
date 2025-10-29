export interface User {
  id: number;
  username: string;
  email: string;
  credits: number;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
  organization?: any;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
}