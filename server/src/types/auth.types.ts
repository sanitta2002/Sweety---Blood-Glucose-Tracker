export interface AuthUserResponse {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: AuthUserResponse;
  token: string;
}
