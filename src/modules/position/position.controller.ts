import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { PositionService } from './position.service';
import { CreatePositionDto } from './dto/createPositionDto';
import { Sequelize } from 'sequelize';
import { Response as ResponseService } from 'src/modules/common/response/response.entity';
import { SEQUELIZE } from 'src/common/contants';
// import { UpdatePositionDto } from './dto/update-position.dto';

@Controller('position')
export class PositionController {
    constructor(
        @Inject(PositionService) private readonly positionService: PositionService,
        private readonly responseService: ResponseService,
        @Inject(SEQUELIZE) private readonly sequelize: Sequelize

    ) { }

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

    // @Get(':id')
    // findOne(@Param('id') id: string) {
    //   return this.positionService.findOne(+id);
    // }

    // @Patch(':id')
    // update(@Param('id') id: string, @Body() updatePositionDto: UpdatePositionDto) {
    //   return this.positionService.update(+id, updatePositionDto);
    // }

    // @Delete(':id')
    // remove(@Param('id') id: string) {
    //   return this.positionService.remove(+id);
    // }
}

export default PositionController