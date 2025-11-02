import { Injectable } from '@nestjs/common';
import { PositionEntity } from './entities/position.entity';
import { InjectModel } from '@nestjs/sequelize';
import { CreatePositionDto } from './dto/createPositionDto';
import { Transaction, UUID } from 'sequelize';
import { DataType } from 'sequelize-typescript';
// import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionService {
  constructor(
    @InjectModel(PositionEntity)
    private readonly positionModel: typeof PositionEntity
  ) { }

  async create(createPositionDto: any, transaction: Transaction): Promise<PositionEntity> {
    try {

      return await this.positionModel.create({...createPositionDto}, { transaction })
    }
    catch (error) {
      console.error('Failed to create position:', error);
      throw error;
    }
    // return 'This action adds a new position';
  }

}
