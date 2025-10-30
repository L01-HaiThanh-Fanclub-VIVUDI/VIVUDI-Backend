import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthEntity } from './entities/auth.entity';
import { AUTH_REPOSITORY } from '../../common/contants';
import { ResponseModule } from '../common/response/response.module';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from '../user/user.module';

@Module({
    imports: [ResponseModule, DatabaseModule, UserModule],
    controllers: [AuthController],
    providers: [
        AuthService,
        {
            provide: AUTH_REPOSITORY,
            useValue: AuthEntity,
        },
    ],
})
export class AuthModule { }
