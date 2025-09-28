export interface User {
    id: string;
    email: string;
    name?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserRegistration {
    email: string;
    password: string;
    name?: string;
}
export interface UserLogin {
    email: string;
    password: string;
}
export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: Omit<User, 'password'>;
    message?: string;
}
import { Request } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
    };
}
//# sourceMappingURL=auth.d.ts.map