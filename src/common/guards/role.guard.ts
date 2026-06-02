import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'generated/prisma/enums';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/roles.decorator';

export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requireRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireRoles) {
      return true;
    }

    // extract autheticated user from request
    const { user } = context.switchToHttp().getRequest();
    return requireRoles.some((role) => user.role === role);
  }
}
