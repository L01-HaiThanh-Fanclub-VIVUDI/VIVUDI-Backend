import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { Response as ResponseService } from 'src/modules/common/response/response.entity';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from 'src/common/contants';
import { BadRequestException, HttpException } from '@nestjs/common';

const mockAuthService = () => ({
    register: jest.fn(),
    login: jest.fn(),
});

const mockResponseService = () => ({
    initResponse: jest.fn((success, message, data) => ({ success, message, data })),
});

const mockSequelize = () => ({
    transaction: jest.fn().mockReturnValue({
        commit: jest.fn(),
        rollback: jest.fn(),
    }),
});

describe('AuthController', () => {
    let controller: AuthController;
    let authService: any;
    let responseService: any;
    let sequelize: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                { provide: AuthService, useFactory: mockAuthService },
                { provide: ResponseService, useFactory: mockResponseService },
                { provide: SEQUELIZE, useFactory: mockSequelize },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get(AuthService);
        responseService = module.get(ResponseService);
        sequelize = module.get(SEQUELIZE);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('register', () => {
        it('should call authService.register and return success', async () => {
            const dto = { email: 'test@example.com', password: 'password123' };
            const mockResult = { user: { id: '1' }, token: 'token' };
            authService.register.mockResolvedValue(mockResult);

            const result = await controller.register(dto as any);

            expect(authService.register).toHaveBeenCalled();
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockResult);
        });

        it('should rollback and throw BadRequestException on error', async () => {
            const transaction = sequelize.transaction();
            authService.register.mockRejectedValue(new BadRequestException('Email exists'));

            await expect(controller.register({} as any)).rejects.toThrow(BadRequestException);
            expect(transaction.rollback).toHaveBeenCalled();
        });

        it('should handle HttpException', async () => {
            authService.register.mockRejectedValue(new HttpException('Server error', 500));

            await expect(controller.register({} as any)).rejects.toThrow(HttpException);
        });
    });

    describe('login', () => {
        it('should call authService.login and return success', async () => {
            const dto = { email: 'test@example.com', password: 'password123' };
            const mockResult = { user: { id: '1' }, token: 'token' };
            authService.login.mockResolvedValue(mockResult);

            const result = await controller.login(dto as any);

            expect(authService.login).toHaveBeenCalled();
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockResult);
        });

        it('should rollback and throw on BadRequestException', async () => {
            const transaction = sequelize.transaction();
            authService.login.mockRejectedValue(new BadRequestException('Invalid credentials'));

            await expect(controller.login({} as any)).rejects.toThrow(BadRequestException);
            expect(transaction.rollback).toHaveBeenCalled();
        });
    });
});
