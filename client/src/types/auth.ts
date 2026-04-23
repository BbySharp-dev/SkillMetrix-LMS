export type Role = 'Student'|'Instructor'|'Admin'|'Moderator';

export interface CurrentUser {
    id: string;
    name: string;
    fullName: string;
    AvatarUrl?: string;
    role:Role
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
    accessTokenExpires: string;
    user: CurrentUser;
}

