import { Controller, Post, Body, Req, Res, Next, UsePipes, ValidationPipe, BadRequestException, HttpException, InternalServerErrorException, UseGuards, Get } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
// import { ForgotPasswordDto } from '../dtos/forgot-password.dto';
// import { VerifyOtpDto } from '../dtos/verify-otp.dto';
// import { ResetPasswordDto } from '../dtos/reset-password.dto';
// import { ChangePasswordDto } from '../dtos/change-password.dto';
import { Response as ResponseService } from 'src/modules/common/response/response.entity';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from 'src/common/contants';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
    user: { userId: string; email: string; };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(
        @Inject(AuthService) private readonly authService: AuthService,
        private readonly responseService: ResponseService,
        @Inject(SEQUELIZE) private readonly sequelize: Sequelize
    ) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiBody({ type: RegisterDto })
    @ApiResponse({
        status: 201,
        description: 'User registered successfully',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Register successfully' },
                data: {
                    type: 'object',
                    properties: {
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                                email: { type: 'string', example: 'user@example.com' },
                                first_name: { type: 'string', example: 'John' },
                                last_name: { type: 'string', example: 'Doe' },
                                display_name: { type: 'string', example: 'John Doe' }
                            }
                        },
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMzYwMH0.example' }
                    }
                }
            },
            example: {
                success: true,
                message: 'Register successfully',
                data: {
                    user: {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        email: 'user@example.com',
                        first_name: 'John',
                        last_name: 'Doe',
                        display_name: 'John Doe'
                    },
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMzYwMH0.example'
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - validation failed',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Email already exists' },
                data: { type: 'null', nullable: true, example: null }
            },
            example: {
                success: false,
                message: 'Email already exists',
                data: null
            }
        }
    })
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
    @ApiOperation({ summary: 'Login user' })
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Login successful' },
                data: {
                    type: 'object',
                    properties: {
                        user: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
                                email: { type: 'string', example: 'user@example.com' },
                                first_name: { type: 'string', example: 'John' },
                                last_name: { type: 'string', example: 'Doe' },
                                display_name: { type: 'string', example: 'John Doe' }
                            }
                        },
                        token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMzYwMH0.example' }
                    }
                }
            },
            example: {
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: '123e4567-e89b-12d3-a456-426614174000',
                        email: 'user@example.com',
                        first_name: 'John',
                        last_name: 'Doe',
                        display_name: 'John Doe'
                    },
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjNlNDU2Ny1lODliLTEyZDMtYTQ1Ni00MjY2MTQxNzQwMDAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJpYXQiOjE3MDAwMDAwMDAsImV4cCI6MTcwMDAwMzYwMH0.example'
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Bad request - invalid credentials',
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: false },
                message: { type: 'string', example: 'Invalid email or password' },
                data: { type: 'null', nullable: true, example: null }
            },
            example: {
                success: false,
                message: 'Invalid email or password',
                data: null
            }
        }
    })
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

