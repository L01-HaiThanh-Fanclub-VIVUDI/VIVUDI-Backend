import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getModelToken } from '@nestjs/sequelize';
import { UserEntity } from '../entities/user.entity';

const mockUserModel = () => ({
    create: jest.fn(),
    findOne: jest.fn(),
});

describe('UserService', () => {
    let service: UserService;
    let model: any;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: getModelToken(UserEntity),
                    useFactory: mockUserModel,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        model = module.get(getModelToken(UserEntity));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createUser', () => {
        it('should call model.create with correct data', async () => {
            const auth_id = 'auth-id';
            const userData = { nickname: 'test' };
            const transaction = {} as any;
            model.create.mockResolvedValue({ id: 'user-id', ...userData });

            const result = await service.createUser(auth_id, userData, transaction);

            expect(model.create).toHaveBeenCalledWith(
                { auth_id, ...userData },
                { transaction },
            );
            expect(result).toEqual({ id: 'user-id', ...userData });
        });
    });

    describe('getUserByAuthId', () => {
        it('should call model.findOne with correct where clause', async () => {
            const auth_id = 'auth-id' as any;
            const transaction = {} as any;
            model.findOne.mockResolvedValue({ id: 'user-id' });

            const result = await service.getUserByAuthId(auth_id, transaction);

            expect(model.findOne).toHaveBeenCalledWith({
                where: { auth_id },
                transaction,
            });
            expect(result).toEqual({ id: 'user-id' });
        });
    });

    describe('checkUserExist', () => {
        it('should return true if user exists', async () => {
            const userId = 'user-id' as any;
            model.findOne.mockResolvedValue({ id: userId });

            const result = await service.checkUserExist(userId);

            expect(model.findOne).toHaveBeenCalledWith({ where: { id: userId } });
            expect(result).toBe(true);
        });

        it('should return false if user does not exist', async () => {
            const userId = 'user-id' as any;
            model.findOne.mockResolvedValue(null);

            const result = await service.checkUserExist(userId);

            expect(result).toBe(false);
        });
    });
});
