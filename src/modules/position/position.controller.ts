import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, InternalServerErrorException, HttpException, Inject, UsePipes, ValidationPipe } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from 'src/common/contants';
import { PositionService } from './services/position.service';
import { CreatePositionDto } from './dtos/create-position.dto';
import { Response as ResponseService } from 'src/modules/common/response/response.entity';
import { Point } from './dtos/point.dto';
import { trace } from 'console';
// import { UpdatePositionDto } from './dto/update-position.dto';

@Controller('position')
export class PositionController {
    constructor(
        private readonly positionService: PositionService,
        @Inject(SEQUELIZE) private readonly sequelize: Sequelize,
        private readonly responseService: ResponseService,
    ) { }

    @Post('create')
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(@Body() createPositionDto: CreatePositionDto) {
        const transaction = await this.sequelize.transaction();
        try {

            const positionInfo = {
                name: createPositionDto.name,
                address: createPositionDto.address || null,
                description: createPositionDto.description || null,
                type: createPositionDto.type,
                coordinate: { type: 'Point', coordinates: [createPositionDto.longtitude, createPositionDto.lattitude] }
            }

            const result = await this.positionService.create(positionInfo, transaction);
            await transaction.commit();

            return this.responseService.initResponse(true, 'Position created successfully', result);
        } catch (error) {
            await transaction.rollback();
            if (error instanceof BadRequestException) {
                throw new BadRequestException(this.responseService.initResponse(false, error.message, null));
            } 
            else if (error instanceof HttpException) {
                throw new HttpException(this.responseService.initResponse(false, error.message, null), error.getStatus());
            }
            throw new InternalServerErrorException(this.responseService.initResponse(false, 'Internal Server Error', null));
        }
    }

    @Get('getInfo/:id')
    async getInfoById(@Param('id') id: string) {
        try {
            const info = await this.positionService.findOneById(id);
            return this.responseService.initResponse(true, "Get info successful", info);
        }
        catch (error) {
            if (error instanceof BadRequestException) {
                throw new BadRequestException(this.responseService.initResponse(false, error.message, null));
            } 
            else if (error instanceof HttpException) {
                throw new HttpException(this.responseService.initResponse(false, error.message, null), error.getStatus());
            }
            throw new InternalServerErrorException(this.responseService.initResponse(false, 'Internal Server Error', null));
        }
    }


    @Get('getInfo/:longtitude/:lattitude/:radius')
    async getInfoNearBy(@Param('longtitude') longtitude: number, @Param('lattitude') lattitude: number, @Param('radius') radius: number) {
        try {
            const coordinate = {
                longtitude: longtitude,
                lattitude: lattitude
            }
            const info = await this.positionService.findAllNearBy(coordinate, radius);
            return this.responseService.initResponse(true, "Get info successful", info);
        }
        catch (error) {
            if (error instanceof BadRequestException) {
                throw new BadRequestException(this.responseService.initResponse(false, error.message, null));
            } 
            else if (error instanceof HttpException) {
                throw new HttpException(this.responseService.initResponse(false, error.message, null), error.getStatus());
            }
            throw new InternalServerErrorException(this.responseService.initResponse(false, 'Internal Server Error', null));
        }
    }


    @Get('getAllInfo')
    async getAllInfo() {
        try {
            const allInfo = await this.positionService.findAll();
            return this.responseService.initResponse(true, "Get all info successful", allInfo);
        }
        catch (error) {
            if (error instanceof BadRequestException) {
                throw new BadRequestException(this.responseService.initResponse(false, error.message, null));
            } 
            else if (error instanceof HttpException) {
                throw new HttpException(this.responseService.initResponse(false, error.message, null), error.getStatus());
            }
            throw new InternalServerErrorException(this.responseService.initResponse(false, 'Internal Server Error', null));
        }
    }

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