// import { Injectable } from '@nestjs/common';
// import { PositionEntity } from '../entities/position.entity';
// import { InjectModel } from '@nestjs/sequelize';
// import { CreatePositionDto } from '../dtos/create-position.dto';
// import { literal, Transaction, UUID } from 'sequelize';
// import { DataType } from 'sequelize-typescript';
// import { PipesConsumer } from '@nestjs/core/pipes';
// import { Point } from '../dtos/point.dto';
// // import { UpdatePositionDto } from './dto/update-position.dto';

// @Injectable()
// export class PointnService {
//     constructor(
//         @InjectModel(PointEntity)
//         private readonly pointRepository: typeof PointEntity
//     ) { }

//     async create(point: any, transaction: Transaction): Promise<PointEntity> {
//         try {

//             return await this.pointRepository.create({ ...point }, { transaction })
//         }
//         catch (error) {
//             console.error('Failed to create position:', error);
//             throw error;
//         }
//         // return 'This action adds a new position';
//     }

//     async findAll(point: Point, radius) {
//         const {longtitude, lattitude} = point 
//         const results = await this.pointRepository.findAll({
//             attributes: {
//                 include: [
//                     [
//                     literal(`
//                         ST_Distance_Sphere(
//                             point(coordinates->"$.coordinates[0]", coordinates->"$.coordinates[1]"),
//                             point(${longtitude}, ${lattitude})
//                         )`),
//                     'distance'
//                     ]
//                 ],
//             },
//             where: literal(`
//                 ST_Distance_Sphere(
//                 point(coordinates->"$.coordinates[0]", coordinates->"$.coordinates[1]"),
//                 point(${longtitude}, ${lattitude})
//                 ) < ${radius} `),
//             order: literal('distance ASC'),
//         });
//         return results
//     }



//     // async findOneById(positionId: string) {
//     //     return await this.positionModel.findByPk(positionId)
//     // }

//     // async remove(id: number, transaction: Transaction) {
//     //     try {
//     //         const position = await this.positionModel.findByPk(id, { transaction });
//     //         if (!position) {
//     //             throw new Error('Position not found');
//     //         }
//     //         await position.destroy({ transaction });
//     //         return `This action removes a #${id} position`;
//     //     } catch (error) {
//     //         console.error('Failed to remove position:', error);
//     //         throw error;
//     //     }
//     // }

//     // async checkPositionExist(positionId: string): Promise<boolean> {
//     //     const position = await this.positionModel.findOne({ where: { id: positionId } });
//     //     return !!position;
//     // }
// }
