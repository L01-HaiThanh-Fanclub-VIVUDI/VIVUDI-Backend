import { Table, Column, Model, PrimaryKey, Default, DataType, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';
import type { UUID } from 'crypto';
import { PostEntity } from './post.entity';
import { MediaType } from '../../../common/contants';

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
    @AllowNull(false)
    @Column(DataType.UUID)
    post_id: UUID;

    @BelongsTo(() => PostEntity)
    post: PostEntity;

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
