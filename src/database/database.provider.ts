import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../common/contants/index';
import { databaseConfig } from './database.config';
import { AuthEntity } from 'src/modules/auth/entities/auth.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { PostEntity } from 'src/modules/post/entities/post.entity';
import { MediaEntity } from 'src/modules/post/entities/media.entity';
import { CommentEntity } from 'src/modules/comment/entities/comment.entity';
import { PositionEntity } from 'src/modules/position/entities/position.entity';

export const databaseProviders = [
    {
        provide: SEQUELIZE,
        useFactory: async () => {
            const config = databaseConfig.database;
            const sequelize = new Sequelize(config);
            sequelize.addModels([AuthEntity, UserEntity, PostEntity, MediaEntity, CommentEntity, PositionEntity]);
            await sequelize.sync();

            try {
                await sequelize.authenticate();
                console.log('Connection has been established successfully');
                await sequelize.sync();
                console.log('Database synchronized successfully');
            } catch (error) {
                console.error('Unable to connect to the database:', error);
            }

            return sequelize;
        },
    },
];
