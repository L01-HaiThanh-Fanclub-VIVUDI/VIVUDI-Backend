import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { AUTH_REPOSITORY } from '../../../common/contants';
import { Response } from '../../common/response/response.entity';
import { UserService } from '../../user/services/user.service';
import { JwtService } from '@nestjs/jwt';
import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
    compare: jest.fn(),
}));

const mockAuthRepository = () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
});

const mockResponse = () => ({
    initResponse: jest.fn(),
});

const mockUserService = () => ({
    createUser: jest.fn(),
    getUserByAuthId: jest.fn(),
});

const mockJwtService = () => ({
    sign: jest.fn(),
});

describe('AuthService', () => {
    let service: AuthService;
    let authRepository: any;
    let userService: any;
    let jwtService: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: AUTH_REPOSITORY, useFactory: mockAuthRepository },
                { provide: Response, useFactory: mockResponse },
                { provide: UserService, useFactory: mockUserService },
                { provide: JwtService, useFactory: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        authRepository = module.get(AUTH_REPOSITORY);
        userService = module.get(UserService);
        jwtService = module.get(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('register', () => {
        const registerDto = {
            email: 'test@example.com',
            phone_number: '0123456789',
            password: 'password123',
        };

        it('should throw BadRequestException if email already exists', async () => {
            authRepository.findOne.mockResolvedValue({ id: '1' });
            await expect(service.register(registerDto as any, {} as any)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw BadRequestException if phone number already exists', async () => {
            authRepository.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce({ id: '1' });
            await expect(service.register(registerDto as any, {} as any)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw BadRequestException if password too short', async () => {
            await expect(service.register({ ...registerDto, password: '123' } as any, {} as any)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should successfully register a user', async () => {
            authRepository.findOne.mockResolvedValue(null);
            const hashedPassword = 'hashedPassword';
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

            const mockUser = {
                id: 'auth-id',
                email: registerDto.email,
                toJSON: () => ({ id: 'auth-id', email: registerDto.email }),
            };
            authRepository.create.mockResolvedValue(mockUser);
            userService.createUser.mockResolvedValue({ id: 'user-profile-id' });
            jwtService.sign.mockReturnValue('mock-token');

            const result = await service.register(registerDto as any, {} as any);

            expect(result).toBeDefined();
            expect(result.token).toBe('mock-token');
        });
    });

    describe('login', () => {
        it('should throw BadRequestException if email or password missing', async () => {
            await expect(service.login('', 'password', {} as any)).rejects.toThrow(BadRequestException);
            await expect(service.login('email', '', {} as any)).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if email not registered', async () => {
            authRepository.findOne.mockResolvedValue(null);
            await expect(service.login('test@example.com', 'password', {} as any)).rejects.toThrow(
                BadRequestException,
            );
        });

        it('should throw BadRequestException if password is wrong', async () => {
            authRepository.findOne.mockResolvedValue({ password: 'hashed' });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);
            await expect(service.login('test', 'wrong', {} as any)).rejects.toThrow(BadRequestException);
        });

        it('should successfully login', async () => {
            const mockUser = {
                id: 'auth-id',
                email: 'test@example.com',
                password: 'hashedPassword',
                toJSON: () => ({ id: 'auth-id', email: 'test@example.com' }),
            };
            authRepository.findOne.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            userService.getUserByAuthId.mockResolvedValue({ id: 'user-profile-id' });
            jwtService.sign.mockReturnValue('mock-token');

            const result = await service.login('test@example.com', 'password', {} as any);

            expect(result).toEqual({
                user: { id: 'auth-id', email: 'test@example.com' },
                token: 'mock-token',
            });
        });
    });

    describe('verifyOTP', () => {
        it('should throw Invalid OTP if record not found', async () => {
            await expect(service.verifyOTP('123456', {} as any)).rejects.toThrow('Invalid OTP');
        });

        it('should throw OTP expired if time passed', async () => {
            (service as any).simulatedOTPStore['111222'] = {
                email: 't@t.com',
                expiresAt: new Date(Date.now() - 1000),
                used: false
            };
            await expect(service.verifyOTP('111222', {} as any)).rejects.toThrow('OTP expired');
        });

        it('should throw OTP already used if used is true', async () => {
            (service as any).simulatedOTPStore['222333'] = {
                email: 't@t.com',
                expiresAt: new Date(Date.now() + 10000),
                used: true
            };
            await expect(service.verifyOTP('222333', {} as any)).rejects.toThrow('OTP already used');
        });

        it('should succeed if OTP is valid', async () => {
            (service as any).simulatedOTPStore['444555'] = {
                email: 'valid@t.com',
                expiresAt: new Date(Date.now() + 10000),
                used: false
            };
            const result = await service.verifyOTP('444555', {} as any);
            expect(result.email).toBe('valid@t.com');
            expect((service as any).simulatedOTPStore['444555'].used).toBe(true);
        });
    });

    describe('changePassword', () => {
        it('should throw if user not found', async () => {
            authRepository.findByPk.mockResolvedValue(null);
            await expect(service.changePassword('1', 'old', 'new', {} as any)).rejects.toThrow('User not registered');
        });

        it('should throw if invalid current password', async () => {
            authRepository.findByPk.mockResolvedValue({ password: 'hashed' });
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);
            await expect(service.changePassword('1', 'old', 'new', {} as any)).rejects.toThrow('Invalid current password');
        });

        it('should change password successfully', async () => {
            authRepository.findByPk.mockResolvedValue({ id: '1', password: 'hashed' });
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            (bcrypt.hash as jest.Mock).mockResolvedValue('newHashed');

            await service.changePassword('1', 'old', 'newPasswordlong', {} as any);
            expect(authRepository.update).toHaveBeenCalledWith({ password: 'newHashed' }, expect.any(Object));
        });
    });
});
