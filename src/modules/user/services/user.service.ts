import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { UserEntity } from '../entities/user.entity';
import { Transaction } from 'sequelize';
import { UUID } from 'crypto';

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

  async getUserByAuthId(auth_id: UUID, transaction: Transaction): Promise<UserEntity | null> {
    return this.userModel.findOne({ where: { auth_id }, transaction });
  }

  async checkUserExist(userId: UUID): Promise<boolean> {
    const user = await this.userModel.findOne({ where: { id: userId } });
    return !!user;
  }
}
