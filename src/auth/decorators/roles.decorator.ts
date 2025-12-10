import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../libs/enums';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
