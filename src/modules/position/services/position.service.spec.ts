import { Test, TestingModule } from '@nestjs/testing';
import { PositionService } from './position.service';
import { getModelToken } from '@nestjs/sequelize';
import { PositionEntity } from '../entities/position.entity';

const mockPositionModel = () => ({
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    destroy: jest.fn(),
});

describe('PositionService', () => {
    let service: PositionService;
    let model: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PositionService,
                {
                    provide: getModelToken(PositionEntity),
                    useFactory: mockPositionModel,
                },
            ],
        }).compile();

        service = module.get<PositionService>(PositionService);
        model = module.get(getModelToken(PositionEntity));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should call model.create', async () => {
            const dto = { name: 'test' };
            model.create.mockResolvedValue({ id: '1', ...dto });

            const result = await service.create(dto, {} as any);

            expect(model.create).toHaveBeenCalledWith(dto, expect.any(Object));
            expect(result.id).toBe('1');
        });

        it('should handle errors', async () => {
            model.create.mockRejectedValue(new Error('DB Error'));

            await expect(service.create({}, {} as any)).rejects.toThrow('DB Error');
        });
    });

    describe('findAll', () => {
        it('should return all positions', async () => {
            model.findAll.mockResolvedValue([{ id: '1' }, { id: '2' }]);

            const result = await service.findAll();

            expect(result.length).toBe(2);
        });
    });

    describe('findOneById', () => {
        it('should return position by id', async () => {
            model.findByPk.mockResolvedValue({ id: '1' });

            const result = await service.findOneById('1');

            expect(result.id).toBe('1');
        });
    });

    describe('findAllNearBy', () => {
        it('should call findAll with spatial query', async () => {
            model.findAll.mockResolvedValue([]);
            const point = { longtitude: 100, lattitude: 10 };

            const result = await service.findAllNearBy(point, 1000);

            expect(model.findAll).toHaveBeenCalledWith(expect.objectContaining({
                where: expect.anything(),
            }));
            expect(result).toEqual([]);
        });
    });

    describe('checkPositionExist', () => {
        it('should return true if found', async () => {
            model.findOne.mockResolvedValue({ id: '1' });
            const result = await service.checkPositionExist('1');
            expect(result).toBe(true);
        });

        it('should return false if not found', async () => {
            model.findOne.mockResolvedValue(null);
            const result = await service.checkPositionExist('1');
            expect(result).toBe(false);
        });
    });

    describe('remove', () => {
        it('should remove position if found', async () => {
            const mockPos = { id: 1, destroy: jest.fn() };
            model.findByPk.mockResolvedValue(mockPos);
            const result = await service.remove(1, {} as any);
            expect(mockPos.destroy).toHaveBeenCalled();
            expect(result).toContain('removes a #1 position');
        });

        it('should throw error if not found', async () => {
            model.findByPk.mockResolvedValue(null);

            await expect(service.remove(1, {} as any)).rejects.toThrow('Position not found');
        });

        it('should handle errors', async () => {
            model.findByPk.mockRejectedValue(new Error('DB Error'));

            await expect(service.remove(1, {} as any)).rejects.toThrow('DB Error');
        });
    });
});
