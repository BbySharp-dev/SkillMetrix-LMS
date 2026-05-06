export type Role = 'Student' | 'Instructor' | 'Admin' | 'Moderator';

export interface UserInfo {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    role: Role;
}

export interface CurrentUser {
    id: string;
    name?: string;
    fullName: string;
    avatarUrl?: string;
    role: Role;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    fullName: string;
    password: string;
    confirmPassword: string;
}

export interface AuthPayload {
    accessToken: string;
    refreshToken: string;
    user: CurrentUser;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: string;
    user: UserInfo;
}

