import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { AuthEntity } from '../entities/auth.entity';
import { AUTH_REPOSITORY } from 'src/common/contants';
import { Response } from 'src/modules/common/response/response.entity';
import { RegisterDto } from '../dtos/register.dto';
import { Transaction } from 'sequelize';
import { UserService } from 'src/modules/user/services/user.service';

@Injectable()
export class AuthService {
    constructor(
        @Inject(AUTH_REPOSITORY) private readonly authRepository: typeof AuthEntity,
        private readonly response: Response,
        private readonly userService: UserService,
    ) {}

    async register(registerDto: RegisterDto, transaction: Transaction) {
        const { email, phone_number: raw_phone_number, password } = registerDto;

        const phone_number = (raw_phone_number === '' || raw_phone_number === undefined || raw_phone_number === null) ? null : raw_phone_number;

        // Check if email exists
        const existingEmail = await this.authRepository.findOne({ where: { email }, transaction });
        if (existingEmail) {
            throw new BadRequestException('Email already exists');
        }

        // Check if phone number exists
        if (phone_number !== null) {
            const existingPhone = await this.authRepository.findOne({ where: { phone_number }, transaction });
            if (existingPhone) {
                throw new BadRequestException('Phone number already exists');
            }
        }

        // Validate password strength
        if (password.length < 8) {
            throw new BadRequestException('Password is too weak');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const userData = {
            email,
            phone_number,
            password: hashedPassword,
            id: uuidv4() // Explicitly generate UUID for the id
        };
        const user = await this.authRepository.create(userData as any, { transaction });

        // Create empty user profile
        await this.userService.createUser(user.id, {}, transaction);

        return user;
    }

    // async login(email: string, password: string) {
    //     // Validate input
    //     if (!email) {
    //         throw this.response.initResponse(false, 'Email is required', null);
    //     }
    //     if (!password) {
    //         throw this.response.initResponse(false, 'Password is required', null);
    //     }

    //     // Find user by email
    //     const user = await this.authRepository.findOne({ where: { email } });
    //     if (!user) {
    //         throw this.response.initResponse(false, 'Email not registered', null);
    //     }

    //     // Verify password
    //     const isValidPassword = await bcrypt.compare(password, user.password);
    //     if (!isValidPassword) {
    //         throw this.response.initResponse(false, 'Wrong password', null);
    //     }

    //     // Generate JWT token with id, email, and role
    //     const token = jwt.sign(
    //         { id: user.id, email: user.email, role: user.role }, // Assuming user has a role property
    //         process.env.JWT_SECRET_KEY || 'your-secret-key',
    //         { expiresIn: '24h' }
    //     );

    //     return this.response.initResponse(true, 'Login successful', { token });
    // }

    // async forgotPassword(email: string) {
    //     // Check if email exists
    //     const user = await this.authRepository.findOne({ where: { email } });
    //     if (!user) {
    //         throw this.response.initResponse(false, 'Email not found', null);
    //     }

    //     // Generate OTP
    //     const otp = generateOTP();
    //     const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    //     expiresAt.setHours(expiresAt.getHours() + 7);
        
    //     // Save OTP to database
    //     // Assuming a PasswordReset entity exists and the authRepository has a method to create it
    //     await this.authRepository.createPasswordReset({
    //         id: generateUUID(),
    //         email,
    //         otp,
    //         expiresAt
    //     });

    //     // Send OTP email
    //     await this.emailService.sendPasswordResetEmail(email, otp);

    //     return this.response.initResponse(true, 'Password reset OTP sent to email', null);
    // }

    // async verifyOTP(otp: string) {
    //     // Find OTP
    //     const resetRecord = await this.authRepository.findOne({ where: { otp } }); // Assuming otp is stored in a PasswordReset entity
    //     if (!resetRecord) {
    //         throw this.response.initResponse(false, 'Invalid OTP', null);
    //     }

    //     // Check if OTP is expired
    //     if (resetRecord.expiresAt < new Date()) {
    //         throw this.response.initResponse(false, 'OTP expired', null);
    //     }

    //     // Check if OTP is already used
    //     if (resetRecord.used) {
    //         throw this.response.initResponse(false, 'OTP already used', null);
    //     }

    //     return this.response.initResponse(true, 'OTP verified successfully', { email: resetRecord.email });
    // }

    // async resetPassword(otp: string, newPassword: string) {
    //     // Find OTP
    //     const resetRecord = await this.authRepository.findOne({ where: { otp } }); // Assuming otp is stored in a PasswordReset entity
    //     if (!resetRecord) {
    //         throw this.response.initResponse(false, 'Invalid OTP', null);
    //     }

    //     // Check if OTP is expired
    //     if (resetRecord.expiresAt < new Date()) {
    //         throw this.response.initResponse(false, 'OTP expired', null);
    //     }

    //     // Check if OTP is already used
    //     if (resetRecord.used) {
    //         throw this.response.initResponse(false, 'OTP already used', null);
    //     }

    //     // Validate password strength
    //     if (newPassword.length < 8) {
    //         throw this.response.initResponse(false, 'Password is too weak', null);
    //     }

    //     // Hash new password
    //     const hashedPassword = await bcrypt.hash(newPassword, 10);

    //     // Update user password
    //     await this.authRepository.update({ password: hashedPassword }, { where: { email: resetRecord.email } });

    //     // Mark OTP as used
    //     await this.authRepository.update({ used: true }, { where: { otp } });

    //     // Send success email
    //     await this.emailService.sendPasswordResetSuccessEmail(resetRecord.email);

    //     return this.response.initResponse(true, 'Password reset successfully', null);
    // }

    // async changePassword(userId: string, currentPassword: string, newPassword: string) {
    //     // Find user by ID
    //     const user = await this.authRepository.findByPk(userId);
    //     if (!user) {
    //         throw this.response.initResponse(false, 'User not registered', null);
    //     }

    //     if (!user.password) {
    //         throw this.response.initResponse(false, 'User has no password set', null);
    //     }
        
    //     // Validate current password
    //     const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    //     if (!isValidCurrentPassword) {
    //         throw this.response.initResponse(false, 'Invalid current password', null);
    //     }

    //     // Validate new password strength
    //     if (newPassword.length < 8) {
    //         throw this.response.initResponse(false, 'New password is too weak', null);
    //     }

    //     // Hash new password
    //     const hashedPassword = await bcrypt.hash(newPassword, 10);

    //     // Update user password
    //     await this.authRepository.update({ password: hashedPassword }, { where: { id: userId } });

    //     return this.response.initResponse(true, 'Password changed successfully', null);
    // }
}

export default AuthService;
