import { AuthService } from './auth.service';
declare class LoginDto {
    email: string;
    password: string;
}
declare class RefreshDto {
    refreshToken: string;
}
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto, req: any): Promise<{
        expiry_warning?: string;
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            force_password_change: boolean;
        };
    }>;
    refresh(dto: RefreshDto): Promise<{
        accessToken: string;
    }>;
    me(req: any): any;
}
export {};
