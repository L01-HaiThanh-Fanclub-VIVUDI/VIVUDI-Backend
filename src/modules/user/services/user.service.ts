import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserEntity } from '../entities/user.entity';
import { Transaction } from 'sequelize';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserEntity) private userModel: typeof UserEntity,
  ) {}

  async createUser(auth_id: string, userData: any, transaction: Transaction): Promise<UserEntity> {
    return this.userModel.create({
      auth_id,
      ...userData
    }, { transaction });
  }
}
