import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, InternalServerErrorException, HttpException, Inject, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from 'src/common/contants';
import { PositionService } from './services/position.service';
import { CreatePositionDto } from './dtos/create-position.dto';
import { Response as ResponseService } from 'src/modules/common/response/response.entity';
import { Point } from './dtos/point.dto';
import { trace } from 'console';
// import { UpdatePositionDto } from './dto/update-position.dto';

@ApiTags('position')
@Controller('position')
export class PositionController {
    constructor(
        private readonly positionService: PositionService,
        @Inject(SEQUELIZE) private readonly sequelize: Sequelize,
        private readonly responseService: ResponseService,
    ) { }

    @Post('create')
    @ApiOperation({ summary: 'Create a new position/location' })
    @ApiBody({ type: CreatePositionDto })
    @ApiResponse({ 
        status: 201, 
        description: 'Position created successfully',
        schema: {
            example: {
                success: true,
                message: 'Position created successfully',
                data: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'Ho Chi Minh City',
                    address: '123 Main Street, District 1',
                    description: 'A beautiful city in Vietnam',
                    type: 'CITY',
                    point: {
                        type: 'Point',
                        coordinates: [106.6297, 10.8231]
                    },
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Bad request - validation failed',
        schema: {
            example: {
                success: false,
                message: 'Validation failed',
                data: null
            }
        }
    })
    @UsePipes(new ValidationPipe({ transform: true }))
    async create(@Body() createPositionDto: CreatePositionDto) {
        const transaction = await this.sequelize.transaction();
        try {

            const positionInfo = {
                name: createPositionDto.name,
                address: createPositionDto.address || null,
                description: createPositionDto.description || null,
                type: createPositionDto.type,
                point: { type: 'Point', coordinates: [createPositionDto.longtitude, createPositionDto.lattitude] }
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
    @ApiOperation({ summary: 'Get position information by ID' })
    @ApiParam({ name: 'id', description: 'Position ID' })
    @ApiResponse({ 
        status: 200, 
        description: 'Position information fetched successfully',
        schema: {
            example: {
                success: true,
                message: 'Get info successful',
                data: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'Ho Chi Minh City',
                    address: '123 Main Street, District 1',
                    description: 'A beautiful city in Vietnam',
                    type: 'CITY',
                    point: {
                        type: 'Point',
                        coordinates: [106.6297, 10.8231]
                    },
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Position not found',
        schema: {
            example: {
                success: false,
                message: 'Position not found',
                data: null
            }
        }
    })
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
    @ApiOperation({ summary: 'Get positions near a location' })
    @ApiParam({ name: 'longtitude', description: 'Longitude coordinate', type: Number })
    @ApiParam({ name: 'lattitude', description: 'Latitude coordinate', type: Number })
    @ApiParam({ name: 'radius', description: 'Search radius in meters', type: Number })
    @ApiResponse({ 
        status: 200, 
        description: 'Nearby positions fetched successfully',
        schema: {
            example: {
                success: true,
                message: 'Get info successful',
                data: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        name: 'Ho Chi Minh City',
                        address: '123 Main Street, District 1',
                        description: 'A beautiful city in Vietnam',
                        type: 'CITY',
                        point: {
                            type: 'Point',
                            coordinates: [106.6297, 10.8231]
                        },
                        distance: 500.5
                    },
                    {
                        id: '123e4567-e89b-12d3-a456-426614174001',
                        name: 'Ben Thanh Market',
                        address: 'Le Loi Street, District 1',
                        description: 'Famous market in HCMC',
                        type: 'MARKET',
                        point: {
                            type: 'Point',
                            coordinates: [106.6296, 10.8230]
                        },
                        distance: 1200.3
                    }
                ]
            }
        }
    })
    async getInfoNearBy(@Param('longtitude') longtitude: number, @Param('lattitude') lattitude: number, @Param('radius') radius: number) {
        try {
            console.log(typeof longtitude)
            const coordinate = {
                longtitude: longtitude,
                lattitude: lattitude
            }
            const info = await this.positionService.findAllNearBy(coordinate, radius);
            return this.responseService.initResponse(true, "Get info successful", info);
        }
        catch (error) {
            console.log(error)
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
    @ApiOperation({ summary: 'Get all positions' })
    @ApiResponse({ 
        status: 200, 
        description: 'All positions fetched successfully',
        schema: {
            example: {
                success: true,
                message: 'Get all info successful',
                data: [
                    {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        name: 'Ho Chi Minh City',
                        address: '123 Main Street, District 1',
                        description: 'A beautiful city in Vietnam',
                        type: 'CITY',
                        point: {
                            type: 'Point',
                            coordinates: [106.6297, 10.8231]
                        },
                        createdAt: '2024-01-01T00:00:00.000Z',
                        updatedAt: '2024-01-01T00:00:00.000Z'
                    },
                    {
                        id: '123e4567-e89b-12d3-a456-426614174001',
                        name: 'Ben Thanh Market',
                        address: 'Le Loi Street, District 1',
                        description: 'Famous market in HCMC',
                        type: 'MARKET',
                        point: {
                            type: 'Point',
                            coordinates: [106.6296, 10.8230]
                        },
                        createdAt: '2024-01-01T00:00:00.000Z',
                        updatedAt: '2024-01-01T00:00:00.000Z'
                    }
                ]
            }
        }
    })
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
    @ApiOperation({ summary: 'Delete a position' })
    @ApiParam({ name: 'id', description: 'Position ID' })
    @ApiResponse({ 
        status: 200, 
        description: 'Position deleted successfully',
        schema: {
            example: {
                success: true,
                message: 'Position deleted successfully',
                data: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    deleted: true
                }
            }
        }
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Position not found',
        schema: {
            example: {
                success: false,
                message: 'Position not found',
                data: null
            }
        }
    })
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