import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// Convenience: require minimum role level
export const MinRole = (role: string) => SetMetadata(ROLES_KEY, [`MIN:${role}`]);
