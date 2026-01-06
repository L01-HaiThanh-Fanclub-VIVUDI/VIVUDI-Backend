import { Test, TestingModule } from '@nestjs/testing';
import { PositionController } from './position.controller';
import { PositionService } from './services/position.service';
import { Response as ResponseService } from 'src/modules/common/response/response.entity';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from 'src/common/contants';
import { BadRequestException, HttpException } from '@nestjs/common';

const mockPositionService = () => ({
    create: jest.fn(),
    findOneById: jest.fn(),
    findAllNearBy: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
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

describe('PositionController', () => {
    let controller: PositionController;
    let service: any;
    let sequelize: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PositionController],
            providers: [
                { provide: PositionService, useFactory: mockPositionService },
                { provide: ResponseService, useFactory: mockResponseService },
                { provide: SEQUELIZE, useFactory: mockSequelize },
            ],
        }).compile();

        controller = module.get<PositionController>(PositionController);
        service = module.get(PositionService);
        sequelize = module.get(SEQUELIZE);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should call service and return success', async () => {
            const dto = { name: 'test', type: 'coffee', longtitude: 1, lattitude: 1 };
            service.create.mockResolvedValue({ id: '1' });

            const result = await controller.create(dto as any);

            expect(service.create).toHaveBeenCalled();
            expect(result.success).toBe(true);
        });

        it('should rollback on error', async () => {
            const transaction = sequelize.transaction();
            service.create.mockRejectedValue(new BadRequestException('Error'));

            await expect(controller.create({} as any)).rejects.toThrow(BadRequestException);
            expect(transaction.rollback).toHaveBeenCalled();
        });
    });

    describe('getInfoById', () => {
        it('should return position info', async () => {
            service.findOneById.mockResolvedValue({ id: '1', name: 'Test' });

            const result = await controller.getInfoById('1');

            expect(result.success).toBe(true);
            expect(result.data.id).toBe('1');
        });

        it('should handle HttpException', async () => {
            service.findOneById.mockRejectedValue(new HttpException('Error', 500));

            await expect(controller.getInfoById('1')).rejects.toThrow(HttpException);
        });
    });

    describe('getInfoNearBy', () => {
        it('should return nearby positions', async () => {
            service.findAllNearBy.mockResolvedValue([{ id: '1' }]);

            const result = await controller.getInfoNearBy(100, 10, 1000);

            expect(service.findAllNearBy).toHaveBeenCalledWith({ longtitude: 100, lattitude: 10 }, 1000);
            expect(result.success).toBe(true);
        });
    });

    describe('getAllInfo', () => {
        it('should call service and return success', async () => {
            service.findAll.mockResolvedValue([]);
            const result = await controller.getAllInfo();
            expect(result.success).toBe(true);
            expect(service.findAll).toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            service.findAll.mockRejectedValue(new BadRequestException('Error'));
            await expect(controller.getAllInfo()).rejects.toThrow(BadRequestException);
        });
    });

    describe('remove', () => {
        it('should remove position', async () => {
            const transaction = sequelize.transaction();
            service.remove.mockResolvedValue('Removed');

            const result = await controller.remove('1');

            expect(service.remove).toHaveBeenCalledWith(1, transaction);
            expect(transaction.commit).toHaveBeenCalled();
        });

        it('should rollback on error', async () => {
            const transaction = sequelize.transaction();
            service.remove.mockRejectedValue(new Error('Error'));

            await expect(controller.remove('1')).rejects.toThrow();
            expect(transaction.rollback).toHaveBeenCalled();
        });
    });
});
