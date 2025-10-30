import { Controller, Post, Body, Req, Res, Next, UsePipes, ValidationPipe, BadRequestException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Inject } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dtos/register.dto';
import { Response as ResponseService } from 'src/modules/common/response/response.entity';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from 'src/common/contants';

@Controller('auth')
export class AuthController {
    constructor(
        @Inject(AuthService) private readonly authService: AuthService,
        private readonly responseService: ResponseService,
        @Inject(SEQUELIZE) private readonly sequelize: Sequelize
    ) {}

    @Post('register')
    @UsePipes(new ValidationPipe({ transform: true }))
    async register(@Body() registerDto: RegisterDto) {
        const transaction = await this.sequelize.transaction();
        try {
            const result = await this.authService.register(registerDto, transaction);

            await transaction.commit();
            return this.responseService.initResponse(true, 'Register successfully', result);
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

    // @Post('login')
    // async login(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    //     try {
    //         const { error, value } = loginSchema.validate(req.body);
    //         if (error) {
    //             // Nếu thiếu email thì trả về MISSING_EMAIL, thiếu password thì trả về MISSING_PASSWORD
    //             const msg = error.details[0].message.toLowerCase();
    //             if (msg.includes('email')) {
    //                 return res.json(
    //                     this.responseService.initResponse(false, LoginStatus.MISSING_EMAIL.message, null)
    //                 );
    //             } else if (msg.includes('password')) {
    //                 return res.json(
    //                     this.responseService.initResponse(false, LoginStatus.MISSING_PASSWORD.message, null)
    //                 );
    //             }
    //         }

    //         const result = await this.authService.login(
    //             value.email,
    //             value.password
    //         );

    //         return res.json(
    //             this.responseService.initResponse(
    //                 true,
    //                 result.message,
    //                 result.data
    //             )
    //         );
    //     } catch (error) {
    //         return res.json(
    //             this.responseService.initResponse(false, error.message, null)
    //         );
    //     }
    // }

    // @Post('forgot-password')
    // async forgotPassword(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    //     try {
    //         const { error, value } = forgotPasswordSchema.validate(req.body);
    //         if (error) {
    //             return res.json(
    //                 this.responseService.initResponse(false, ForgotPasswordStatus.INVALID_DATA.message, null)
    //             );
    //         }

    //         const result = await this.authService.forgotPassword(value.email);

    //         return res.json(
    //             this.responseService.initResponse(true, result.message, result.data)
    //         );
    //     } catch (error) {
    //         return res.json(
    //             this.responseService.initResponse(false, error.message, null)
    //         );
    //     }
    // }

    // @Post('verify-otp')
    // async verifyOTP(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    //     try {
    //         const { error, value } = verifyOTPSchema.validate(req.body);
    //         if (error) {
    //             return res.json(
    //                 this.responseService.initResponse(false, VerifyOTPStatus.INVALID_DATA.message, null)
    //                 );
    //             }
                
    //         const result = await this.authService.verifyOTP(value.otp);
    //         
    //         return res.json(
    //             this.responseService.initResponse(true, result.message, result.data)
    //             );
    //         } catch (error) {
    //             return res.json(
    //             this.responseService.initResponse(false, error.message, null)
    //             );
    //         }
    //     }
    
    // @Post('reset-password')
    // async resetPassword(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
    //     try {
    //         const { error, value } = resetPasswordSchema.validate(req.body);
    //         if (error) {
    //             return res.json(
    //                 this.responseService.initResponse(false, ResetPasswordStatus.INVALID_DATA.message, null)
    //             );
    //         }

    //         const result = await this.authService.resetPassword(
    //             value.otp,
    //             value.password
    //         );

    //         return res.json(
    //             this.responseService.initResponse(true, result.message, result.data)
    //         );
    //     } catch (error) {
    //         return res.json(
    //             this.responseService.initResponse(false, error.message, null)
    //         );
    //     }
    // }

    // @Post('change-password')
    // async changePassword(@Req() req: AuthenticatedRequest, @Res() res: Response, @Next() next: NextFunction) {
    //     try {
    //         const { error, value } = changePasswordSchema.validate(req.body);
    //         if (error) {
    //             // Check if error is related to password validation
    //             const isPasswordError = error.details[0].message.toLowerCase().includes('password') && 
    //                 !error.details[0].message.toLowerCase().includes('required');
    //             const status = isPasswordError ? ChangePasswordStatus.WEAK_PASSWORD : ChangePasswordStatus.INVALID_DATA;
                
    //             return res.json(
    //                 this.responseService.initResponse(false, status.message, null)
    //             );
    //         }

    //         if (!req.user?.id) {
    //             return res.json(
    //                 this.responseService.initResponse(false, "User not authenticated", null)
    //             );
    //         }

    //         const result = await this.authService.changePassword(
    //             req.user.id,
    //             value.current_password,
    //             value.new_password
    //         );

    //         return res.json(
    //             this.responseService.initResponse(true, result.message, result.data)
    //         );
    //     } catch (error) {
    //         return res.json(
    //             this.responseService.initResponse(false, error.message, null)
    //         );
    //     }
    // }
}

export default AuthController;

