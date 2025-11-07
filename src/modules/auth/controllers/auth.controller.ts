import { Controller, Post, Body, Req, Res, Next, UsePipes, ValidationPipe, BadRequestException, HttpException, InternalServerErrorException, UseGuards, Get } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Inject } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
import { VerifyOtpDto } from '../dtos/verify-otp.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { ChangePasswordDto } from '../dtos/change-password.dto';
import { Response as ResponseService } from 'src/modules/common/response/response.entity';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from 'src/common/contants';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
    user: { userId: string; email: string; };
}

@Controller('auth')
export class AuthController {
    constructor(
        @Inject(AuthService) private readonly authService: AuthService,
        private readonly responseService: ResponseService,
        @Inject(SEQUELIZE) private readonly sequelize: Sequelize
    ) { }

    @Post('register')
    @UsePipes(new ValidationPipe({ transform: true }))
    async register(@Body() registerDto: RegisterDto) {
        const transaction = await this.sequelize.transaction();
        try {
            const { user, token } = await this.authService.register(registerDto, transaction);

            await transaction.commit();
            return this.responseService.initResponse(true, 'Register successfully', { user, token });
        } catch (error) {
            await transaction.rollback();
            if (error instanceof BadRequestException) {
                throw new BadRequestException(this.responseService.initResponse(false, error.message, null));
            } else if (error instanceof HttpException) {
                throw new HttpException(this.responseService.initResponse(false, error.message, null), error.getStatus());
            }
            throw new InternalServerErrorException(this.responseService.initResponse(false, 'Internal Server Error', null));
        }
    }

    @Post('login')
    @UsePipes(new ValidationPipe({ transform: true }))
    async login(@Body() loginDto: LoginDto) {
        const transaction = await this.sequelize.transaction();
        try {
            const result = await this.authService.login(loginDto.email, loginDto.password, transaction);

            await transaction.commit();
            return this.responseService.initResponse(true, 'Login successful', result);
        } catch (error) {
            await transaction.rollback();
            if (error instanceof BadRequestException) {
                throw new BadRequestException(this.responseService.initResponse(false, error.message, null));
            } else if (error instanceof HttpException) {
                throw new HttpException(this.responseService.initResponse(false, error.message, null), error.getStatus());
            }
            throw new InternalServerErrorException(this.responseService.initResponse(false, 'Internal Server Error', null));
        }
    }

    // @UseGuards(JwtAuthGuard)
    // @Get('profile')
    // getProfile(@Req() req) {
    //     return this.responseService.initResponse(true, 'Profile fetched successfully', req.user);
    // }

    // @Post('forgot-password')
    // @UsePipes(new ValidationPipe({ transform: true }))
    // async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    //     const transaction = await this.sequelize.transaction();
    //     try {
    //         await this.authService.forgotPassword(forgotPasswordDto.email, transaction);

    //         await transaction.commit();
    //         return this.responseService.initResponse(true, 'Password reset OTP sent to email', null);
    //     } catch (error) {
    //         await transaction.rollback();
    //         if (error instanceof BadRequestException) {
    //             throw new BadRequestException(this.responseService.initResponse(false, error.message, null));
    //         } else if (error instanceof HttpException) {
    //             throw new HttpException(this.responseService.initResponse(false, error.message, null), error.getStatus());
    //         }
    //         throw new InternalServerErrorException(this.responseService.initResponse(false, 'Internal Server Error', null));
    //     }
    // }

    // @Post('verify-otp')
    // @UsePipes(new ValidationPipe({ transform: true }))
    // async verifyOTP(@Body() verifyOtpDto: VerifyOtpDto) {
    //     const transaction = await this.sequelize.transaction();
    //     try {
    //         const result = await this.authService.verifyOTP(verifyOtpDto.otp, transaction);

    //         await transaction.commit();
    //         return this.responseService.initResponse(true, 'OTP verified successfully', result);
    //     } catch (error) {
    //         await transaction.rollback();
    //         if (error instanceof BadRequestException) {
    //             throw new BadRequestException(this.responseService.initResponse(false, error.message, null));
    //         } else if (error instanceof HttpException) {
    //             throw new HttpException(this.responseService.initResponse(false, error.message, null), error.getStatus());
    //         }
    //         throw new InternalServerErrorException(this.responseService.initResponse(false, 'Internal Server Error', null));
    //     }
    // }

    // @Post('reset-password')
    // @UsePipes(new ValidationPipe({ transform: true }))
    // async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    //     const transaction = await this.sequelize.transaction();
    //     try {
    //         await this.authService.resetPassword(
    //             resetPasswordDto.otp,
    //             resetPasswordDto.password,
    //             transaction
    //         );

    //         await transaction.commit();
    //         return this.responseService.initResponse(true, 'Password reset successfully', null);
    //     } catch (error) {
    //         await transaction.rollback();
    //         if (error instanceof BadRequestException) {
    //             throw new BadRequestException(this.responseService.initResponse(false, error.message, null));
    //         } else if (error instanceof HttpException) {
    //             throw new HttpException(this.responseService.initResponse(false, error.message, null), error.getStatus());
    //         }
    //         throw new InternalServerErrorException(this.responseService.initResponse(false, 'Internal Server Error', null));
    //     }
    // }

    // @UseGuards(JwtAuthGuard)
    // @Post('change-password')
    // @UsePipes(new ValidationPipe({ transform: true }))
    // async changePassword(@Req() req: AuthenticatedRequest, @Body() changePasswordDto: ChangePasswordDto) {
    //     const transaction = await this.sequelize.transaction();
    //     try {
    //         if (!req.user?.userId) {
    //             throw new BadRequestException("User not authenticated");
    //         }

    //         await this.authService.changePassword(
    //             req.user.userId,
    //             changePasswordDto.current_password,
    //             changePasswordDto.new_password,
    //             transaction
    //         );

    //         await transaction.commit();
    //         return this.responseService.initResponse(true, 'Password changed successfully', null);
    //     } catch (error) {
    //         await transaction.rollback();
    //         if (error instanceof BadRequestException) {
    //             throw new BadRequestException(this.responseService.initResponse(false, error.message, null));
    //         } else if (error instanceof HttpException) {
    //             throw new HttpException(this.responseService.initResponse(false, error.message, null), error.getStatus());
    //         }
    //         throw new InternalServerErrorException(this.responseService.initResponse(false, 'Internal Server Error', null));
    //     }
    // }
}

export default AuthController;

