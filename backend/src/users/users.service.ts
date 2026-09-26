import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly model: Model<UserDocument>,
  ) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.model.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async findById(id: string): Promise<UserDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    return this.model.findById(id).exec();
  }

  async create(data: {
    email: string;
    password: string;
  }): Promise<UserDocument> {
    return this.model.create(data);
  }

  async incrementTokenVersion(id: string): Promise<void> {
    await this.model
      .updateOne({ _id: id }, { $inc: { tokenVersion: 1 } })
      .exec();
  }
}
