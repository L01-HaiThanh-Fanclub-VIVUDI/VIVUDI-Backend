import { Injectable } from '@nestjs/common';
import { PositionEntity } from './entities/position.entity';
import { InjectModel } from '@nestjs/sequelize';
import { CreatePositionDto } from './dtos/create-position.dto';
import { Transaction, UUID } from 'sequelize';
import { DataType } from 'sequelize-typescript';
// import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionService {
  constructor(
    @InjectModel(PositionEntity)
    private readonly positionModel: typeof PositionEntity
  ) { }

  async create(createPositionDto: CreatePositionDto, transaction: Transaction): Promise<PositionEntity> {
    try {

      return await this.positionModel.create({...createPositionDto} as any, { transaction })
    }
    catch (error) {
      console.error('Failed to create position:', error);
      throw error;
    }
    // return 'This action adds a new position';
  }

  findAll() {
    return this.positionModel.findAll();
  }

  findOne(id: number) {
    return `This action returns a #${id} position`;
  }

  async remove(id: number, transaction: Transaction) {
    try {
      const position = await this.positionModel.findByPk(id, { transaction });
      if (!position) {
        throw new Error('Position not found');
      }
      await position.destroy({ transaction });
      return `This action removes a #${id} position`;
    } catch (error) {
      console.error('Failed to remove position:', error);
      throw error;
    }
  }

  async checkPositionExist(positionId: string): Promise<boolean> {
    const position = await this.positionModel.findOne({ where: { id: positionId } });
    return !!position;
  }
}
