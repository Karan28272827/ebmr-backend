import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

const ROLE_HIERARCHY = {
  BATCH_OPERATOR: 1,
  SUPERVISOR: 2,
  QA_REVIEWER: 3,
  QA_MANAGER: 4,
  QUALIFIED_PERSON: 5,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    // Check if user has at least one of the required roles (by hierarchy level)
    const userLevel = ROLE_HIERARCHY[user.role] || 0;
    return requiredRoles.some((role) => {
      if (role.startsWith('MIN:')) {
        const minRole = role.replace('MIN:', '');
        return userLevel >= (ROLE_HIERARCHY[minRole] || 0);
      }
      return user.role === role;
    });
  }
}
