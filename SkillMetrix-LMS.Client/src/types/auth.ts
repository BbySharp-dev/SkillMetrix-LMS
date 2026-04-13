export type Role = "Student" | "Instructor" | "Admin" | "Moderator";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  user: CurrentUser;
}
