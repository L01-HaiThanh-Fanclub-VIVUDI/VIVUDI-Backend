import { Table, Column, Model, PrimaryKey, Default, DataType, AllowNull, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';
import type { UUID } from 'crypto';
import { AuthEntity } from '../../auth/entities/auth.entity';

@Table({
    tableName: 'User'
})
export class UserEntity extends Model<UserEntity> {
    @PrimaryKey
    @Default(UUIDV4)
    @AllowNull(false)
    @Column(DataType.UUID)
    id: UUID;

    @ForeignKey(() => AuthEntity)
    @AllowNull(false)
    @Column(DataType.UUID)
    auth_id: UUID;

    @BelongsTo(() => AuthEntity)
    auth: AuthEntity;

    @AllowNull(true)
    @Column(DataType.STRING)
    first_name: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    last_name: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    sex: string;

    @AllowNull(true)
    @Column(DataType.DATEONLY)
    dob: Date;

    @AllowNull(true)
    @Column(DataType.STRING)
    display_name: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    description: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    avt_url: string;

    @AllowNull(true)
    @Column(DataType.STRING)
    backgrd_url: string;
}
