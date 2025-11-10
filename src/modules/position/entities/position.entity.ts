import { Table, Column, Model, PrimaryKey, Default, DataType, AllowNull, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { Sequelize, UUIDV4 } from 'sequelize';
import type { UUID } from 'crypto';
import { MediaEntity } from 'src/modules/post/entities/media.entity';
import { LocationType } from 'src/common/contants';

@Table({
    tableName: 'Position',
    timestamps: true,
})
export class PositionEntity extends Model<PositionEntity> {
    @PrimaryKey
    @Default(UUIDV4)
    @AllowNull(false)
    @Column(DataType.UUID)
    id: UUID;

    @AllowNull(false)
    @Column(DataType.STRING)
    name: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    address: string;
    
    @AllowNull(true)
    @Column(DataType.STRING)
    description: string;

    @AllowNull(false)
    @Column(DataType.GEOMETRY('POINT'))
    point: object;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(LocationType) as string[]))
    type: LocationType;
   
    @HasMany(() => MediaEntity)
    medias: MediaEntity[];

}
