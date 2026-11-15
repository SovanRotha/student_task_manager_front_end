export interface User {
    id: number;
    name: string;
    email: string;
    password: string;
    role: string;
    profile: string;
    status: string;
}

export interface AuthResponse {
    token: string;
    user: User;
}

export interface Login {
    email: string;
    password: string;
}