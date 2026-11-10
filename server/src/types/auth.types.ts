export interface AuthUserResponse {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: AuthUserResponse;
  token: string;
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}
