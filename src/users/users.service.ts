import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { toObjectId } from '../libs/config';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(userData: Partial<User>): Promise<UserDocument> {
    const user = new this.userModel(userData);
    return user.save();
  }

  async findById(id: string | Types.ObjectId): Promise<UserDocument | null> {
    return this.userModel.findById(toObjectId(id)).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase() }).exec();
  }

  async findByGoogleId(googleId: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ googleId }).exec();
  }

  async findByRestaurant(
    restaurantId: string | Types.ObjectId,
  ): Promise<UserDocument[]> {
    const rid = toObjectId(restaurantId);
    return this.userModel.find({ restaurantId: rid }).exec();
  }

  async update(
    id: string | Types.ObjectId,
    updateData: Partial<User>,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findByIdAndUpdate(toObjectId(id), updateData, { new: true })
      .exec();
  }

  async delete(id: string | Types.ObjectId): Promise<boolean> {
    const result = await this.userModel
      .findByIdAndDelete(toObjectId(id))
      .exec();
    return !!result;
  }
}
