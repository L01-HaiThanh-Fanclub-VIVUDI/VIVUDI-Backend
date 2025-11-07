import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { AuthEntity } from '../entities/auth.entity';
import { AUTH_REPOSITORY } from 'src/common/contants';
import { Response } from 'src/modules/common/response/response.entity';
import { RegisterDto } from '../dtos/register.dto';
import { Transaction } from 'sequelize';
import { UserService } from 'src/modules/user/services/user.service';
import { JwtService } from '@nestjs/jwt';

function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class AuthService {
    constructor(
        @Inject(AUTH_REPOSITORY) private readonly authRepository: typeof AuthEntity,
        private readonly response: Response,
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
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

        // Create user profile and get the user entity
        const userProfile = await this.userService.createUser(user.id, {}, transaction);

        // Generate JWT token with user_id (from UserEntity), email, and role after successful registration
        const payload = { userId: userProfile.id, email: user.email }; // Use userProfile.id here
        const token = this.jwtService.sign(payload);

        const { password: _, ...userWithoutPassword } = user.toJSON();
        return { user: userWithoutPassword, token };
    }

    async login(email: string, password: string, transaction: Transaction) {
        // Validate input
        if (!email) {
            throw new BadRequestException('Email is required');
        }
        if (!password) {
            throw new BadRequestException('Password is required');
        }

        // Find user by email
        const user = await this.authRepository.findOne({ where: { email }, transaction });
        if (!user) {
            throw new BadRequestException('Email not registered');
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new BadRequestException('Wrong password');
        }

        // Generate JWT token with user_id (from UserEntity), email, and role
        const userProfile = await this.userService.getUserByAuthId(user.id as any, transaction); // Explicitly cast user.id to UUID
        if (!userProfile) {
          throw new BadRequestException('User profile not found.');
        }
        const payload = { userId: userProfile.id, email: user.email /*, role: userProfile.role */ }; // Use userProfile.id here
        const token = this.jwtService.sign(payload);

        const { password: _, ...userWithoutPassword } = user.toJSON();
        return { user: userWithoutPassword, token };
    }

    // async forgotPassword(email: string, transaction: Transaction) {
    //     // Check if email exists
    //     const user = await this.authRepository.findOne({ where: { email }, transaction });
    //     if (!user) {
    //         throw new BadRequestException('Email not found');
    //     }

    //     // Generate OTP
    //     const otp = generateOTP();
    //     const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    //     // expiresAt.setHours(expiresAt.getHours() + 7); // Adjust for UTC if needed

    //     // Save OTP to database
    //     // Assuming a PasswordReset entity exists and the authRepository has a method to create it
    //     // For now, let's assume a temporary in-memory store or a simple entity
    //     // In a real application, you would create a PasswordReset entity and store it in the database.
    //     // For simplicity, I'll just log it for now.
    //     console.log(`Generated OTP for ${email}: ${otp}, expires at: ${expiresAt}`);

    //     // Send OTP email
    //     await this.emailService.sendPasswordResetEmail(email, otp);

    //     return this.response.initResponse(true, 'Password reset OTP sent to email', null);
    // }

    async verifyOTP(otp: string, transaction: Transaction) {
        // Find OTP in database (replace with actual database lookup)
        // For now, simulate lookup and assume valid for a short period.
        const simulatedOTPStore = {}; // This should be replaced with a real database table/entity
        const resetRecord = simulatedOTPStore[otp]; // This would be a database query

        if (!resetRecord) {
            throw new BadRequestException('Invalid OTP');
        }

        if (resetRecord.expiresAt < new Date()) {
            throw new BadRequestException('OTP expired');
        }

        if (resetRecord.used) {
            throw new BadRequestException('OTP already used');
        }

        // Mark OTP as used (replace with database update)
        resetRecord.used = true;

        return { email: resetRecord.email };
    }

    // async resetPassword(otp: string, newPassword: string, transaction: Transaction) {
    //     // Find OTP in database (replace with actual database lookup)
    //     const simulatedOTPStore = {}; // This should be replaced with a real database table/entity
    //     const resetRecord = simulatedOTPStore[otp]; // This would be a database query

    //     if (!resetRecord) {
    //         throw new BadRequestException('Invalid OTP');
    //     }

    //     if (resetRecord.expiresAt < new Date()) {
    //         throw new BadRequestException('OTP expired');
    //     }

    //     if (resetRecord.used) {
    //         throw new BadRequestException('OTP already used');
    //     }

    //     if (newPassword.length < 8) {
    //         throw new BadRequestException('Password is too weak');
    //     }

    //     const hashedPassword = await bcrypt.hash(newPassword, 10);

    //     // Update user password in database (replace with actual database update)
    //     // await this.authRepository.update({ password: hashedPassword }, { where: { email: resetRecord.email } });

    //     // Mark OTP as used (replace with database update)
    //     // await this.authRepository.update({ used: true }, { where: { otp } });

    //     // Send success email
    //     await this.emailService.sendPasswordResetSuccessEmail(resetRecord.email);

    //     return null;
    // }

    async changePassword(userId: string, currentPassword: string, newPassword: string, transaction: Transaction) {
        const user = await this.authRepository.findByPk(userId, { transaction });
        if (!user) {
            throw new BadRequestException('User not registered');
        }

        if (!user.password) {
            throw new BadRequestException('User has no password set');
        }

        const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidCurrentPassword) {
            throw new BadRequestException('Invalid current password');
        }

        if (newPassword.length < 8) {
            throw new BadRequestException('New password is too weak');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.authRepository.update({ password: hashedPassword }, { where: { id: userId }, transaction });

        return null;
    }
}

export default AuthService;
