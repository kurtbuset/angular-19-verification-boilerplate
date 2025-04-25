import { Role } from './role';

export class Account {
    id: string;
    title: string;
    firstName: string;
    lastName: string;
    email: string;
    isActive: boolean
    role: Role;
    jwtToken?: string;
}