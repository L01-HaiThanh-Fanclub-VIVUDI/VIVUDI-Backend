import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, InternalServerErrorException, HttpException } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Inject } from '@nestjs/common';
import { SEQUELIZE } from 'src/common/contants';
import { PositionService } from './position.service';
import { CreatePositionDto } from './dto/createPositionDto';
// import { UpdatePositionDto } from './dto/update-position.dto';

@Controller('position')
export class PositionController {
  constructor(
    private readonly positionService: PositionService,
    @Inject(SEQUELIZE) private readonly sequelize: Sequelize
  ) {}

  @Post()
  async create(@Body() createPositionDto: CreatePositionDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const result = await this.positionService.create(createPositionDto, transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }

  @Get()
  findAll() {
    return this.positionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.positionService.findOne(+id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updatePositionDto: UpdatePositionDto) {
  //   return this.positionService.update(+id, updatePositionDto);
  // }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const transaction = await this.sequelize.transaction();
    try {
      const result = await this.positionService.remove(+id, transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      if (error instanceof BadRequestException) {
        throw new BadRequestException(error.message);
      } else if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
