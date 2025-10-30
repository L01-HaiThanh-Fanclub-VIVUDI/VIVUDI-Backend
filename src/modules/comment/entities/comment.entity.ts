import { Table, Column, Model, PrimaryKey, Default, DataType, AllowNull, ForeignKey, BelongsTo, HasMany } from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';
import type { UUID } from 'crypto';
import { PostEntity } from '../../post/entities/post.entity';
import { UserEntity } from '../../user/entities/user.entity';

@Table({
    tableName: 'Comment'
})
export class CommentEntity extends Model<CommentEntity> {
    @PrimaryKey
    @Default(UUIDV4)
    @AllowNull(false)
    @Column(DataType.UUID)
    id: UUID;

    @AllowNull(false)
    @Column(DataType.TEXT)
    content: string;

    @ForeignKey(() => PostEntity)
    @AllowNull(false)
    @Column(DataType.UUID)
    post_id: UUID;

    @BelongsTo(() => PostEntity)
    post: PostEntity;

    @ForeignKey(() => UserEntity)
    @AllowNull(false)
    @Column(DataType.UUID)
    user_id: UUID;

    @BelongsTo(() => UserEntity)
    user: UserEntity;

    @ForeignKey(() => CommentEntity)
    @AllowNull(true)
    @Column(DataType.UUID)
    parent_id: UUID;

    @BelongsTo(() => CommentEntity, {
        as: 'parent_comment',
        foreignKey: 'parent_id'
    })
    parent_comment: CommentEntity;

    @HasMany(() => CommentEntity, {
        as: 'child_comments',
        foreignKey: 'parent_id'
    })
    child_comments: CommentEntity[];
}
