import { Request } from 'express';
import { UserRole } from '../../libs/enums';

/**
 * Interface representing the payload decoded from a JWT.
 */
export interface JwtPayload {
  userId: string;
  email: string;
  restaurantId: string;
  role: UserRole;
  nickname?: string;
}

/**
 * Interface representing an Express request that has been authenticated
 * and populated with user data by the JwtStrategy.
 */
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
