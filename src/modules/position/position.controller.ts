import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, InternalServerErrorException, HttpException, Inject, UsePipes, ValidationPipe } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from 'src/common/contants';
import { PositionService } from './position.service';
import { CreatePositionDto } from './dtos/create-position.dto';
import { Response as ResponseService } from 'src/modules/common/response/response.entity';
// import { UpdatePositionDto } from './dto/update-position.dto';

@Controller('position')
export class PositionController {
  constructor(
    private readonly positionService: PositionService,
    @Inject(SEQUELIZE) private readonly sequelize: Sequelize,
    private readonly responseService: ResponseService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(@Body() createPositionDto: CreatePositionDto) {
    const transaction = await this.sequelize.transaction();
    try {
      const result = await this.positionService.create(createPositionDto, transaction);
      await transaction.commit();
      return this.responseService.initResponse(true, 'Position created successfully', result);
    } catch (error) {
      await transaction.rollback();
      if (error instanceof BadRequestException) {
        throw new BadRequestException(this.responseService.initResponse(false, error.message, null));
      } else if (error instanceof HttpException) {
        throw new HttpException(this.responseService.initResponse(false, error.message, null), error.getStatus());
      }
      throw new InternalServerErrorException(this.responseService.initResponse(false, 'Internal Server Error', null));
    }
  }

    @Post('createPosition')
    async create(@Body() createPositionDto: CreatePositionDto) {
        const transaction = await this.sequelize.transaction();
        try {
            const position = await this.positionService.create(createPositionDto, transaction);

            await transaction.commit()
            return this.responseService.initResponse(true, "Create position successfully", position);
        }
        catch (error) {
            await transaction.rollback()
            console.log(`Error: ${error}`)
            return this.responseService.initResponse(true, "Something is wrong", null);
        }
    }

    // @Get()
    // findAll() {
    //   return this.positionService.findAll();
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

export default PositionController