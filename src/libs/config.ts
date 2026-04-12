import { Types } from 'mongoose';
import { BadRequestException } from '@nestjs/common';

/**
 * toObjectId
 *
 * Best practice utility for converting string IDs from the Frontend
 * into MongoDB ObjectIds for safe Backend querying.
 *
 * @param id - The ID string or ObjectId to convert.
 * @returns The converted Types.ObjectId.
 * @throws BadRequestException if the string is not a valid MongoDB hex sequence.
 */
export function toObjectId(id: string | Types.ObjectId): Types.ObjectId {
  if (id instanceof Types.ObjectId) return id;

  if (!Types.ObjectId.isValid(id)) {
    throw new BadRequestException(`Invalid MongoDB ID format: ${id}`);
  }

  return new Types.ObjectId(id);
}

/**
 * toObjectIds
 *
 * Normalizes an array of string IDs into MongoDB ObjectIds.
 */
export function toObjectIds(
  ids: (string | Types.ObjectId)[],
): Types.ObjectId[] {
  return ids.map((id) => toObjectId(id));
}

/**
 * isSameId
 *
 * Safely compares two MongoDB IDs (regardless of whether they are strings or ObjectIds).
 */
export function isSameId(
  a: string | Types.ObjectId | null | undefined,
  b: string | Types.ObjectId | null | undefined,
): boolean {
  if (!a || !b) return false;
  return a.toString() === b.toString();
}
