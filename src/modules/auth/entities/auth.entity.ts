import { Table, Column, Model, PrimaryKey, Default, DataType, AllowNull, Unique } from 'sequelize-typescript';
import { UUIDV4 } from 'sequelize';
import type { UUID } from 'crypto';

@Table({
    tableName: 'Auth'
})
export class AuthEntity extends Model<AuthEntity> {
    @PrimaryKey
    @Default(UUIDV4)
    @AllowNull(false)
    @Column(DataType.UUID)
    id: UUID;

    @Unique
    @AllowNull(false)
    @Column(DataType.STRING)
    email: string;

    @Unique
    @AllowNull(true)
    @Column(DataType.STRING)
    phone_number: string;

    @AllowNull(false)
    @Column(DataType.STRING)
    password: string;
}
