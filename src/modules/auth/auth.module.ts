import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { AuthEntity } from './entities/auth.entity';
import { AUTH_REPOSITORY } from '../../common/contants';
import { ResponseModule } from '../common/response/response.module';
import { DatabaseModule } from 'src/database/database.module';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './guards/jwt.strategy';

@Module({
    imports: [
        ResponseModule,
        DatabaseModule,
        UserModule,
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET_KEY || 'your-secret-key',
            signOptions: { expiresIn: '24h' },
        }),
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtStrategy,
        {
            provide: AUTH_REPOSITORY,
            useValue: AuthEntity,
        },
    ],
})
export class AuthModule { }
