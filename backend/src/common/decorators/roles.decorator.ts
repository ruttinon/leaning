import { SetMetadata } from '@nestjs/common';

type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
