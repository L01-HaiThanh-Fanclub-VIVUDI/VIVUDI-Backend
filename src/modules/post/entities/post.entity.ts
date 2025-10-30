import { Table, Column, Model, PrimaryKey, Default, DataType, AllowNull, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';
import type { UUID } from 'crypto';
import { UserEntity } from '../../user/entities/user.entity';
import { PostVisibility } from '../../../common/contants';
import { MediaEntity } from './media.entity';
import { CommentEntity } from '../../comment/entities/comment.entity';

@Table({
    tableName: 'Post'
})
export class PostEntity extends Model<PostEntity> {
    @PrimaryKey
    @Default(UUIDV4)
    @AllowNull(false)
    @Column(DataType.UUID)
    id: UUID;

    @AllowNull(false)
    @Column(DataType.TEXT)
    content: string;

    @ForeignKey(() => UserEntity)
    @AllowNull(false)
    @Column(DataType.UUID)
    author_id: UUID;

    @BelongsTo(() => UserEntity)
    author: UserEntity;

    @AllowNull(false)
    @Column(DataType.ENUM(...Object.values(PostVisibility) as string[]))
    visibility: PostVisibility;

    @AllowNull(true)
    @Column(DataType.STRING)
    location_id: string;

    @AllowNull(true)
    @Column(DataType.FLOAT)
    rating: number;

    @HasMany(() => MediaEntity)
    medias: MediaEntity[];

    @HasMany(() => CommentEntity)
    comments: CommentEntity[];
}
