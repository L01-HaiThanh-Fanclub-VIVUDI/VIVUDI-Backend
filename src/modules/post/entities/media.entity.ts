import { Table, Column, Model, PrimaryKey, Default, DataType, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';
import type { UUID } from 'crypto';
import { PostEntity } from './post.entity';
import { MediaType, OwnerMediaType } from '../../../common/contants';
import { PositionEntity } from 'src/modules/position/entities/position.entity';

@Table({
    tableName: 'Media'
})
export class MediaEntity extends Model<MediaEntity> {
    @PrimaryKey
    @Default(UUIDV4)
    @AllowNull(false)
    @Column(DataType.UUID)
    id: UUID;

    @ForeignKey(() => PostEntity)
    @AllowNull(true)
    @Column(DataType.UUID)
    post_id: UUID;

    @BelongsTo(() => PostEntity)
    post: PostEntity;
    
    @ForeignKey(() => PositionEntity)
    @AllowNull(false)
    @Column(DataType.UUID)
    location_id: UUID;

    @BelongsTo(() => PositionEntity)
    location: PositionEntity;

    @AllowNull(false)
    @Column(DataType.STRING)
    owner_type: OwnerMediaType;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(MediaType) as string[]))
    type: MediaType;

    @AllowNull(false)
    @Column(DataType.STRING)
    url: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    thumbnail_url: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    folder_path: string;
}
