import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [JwtStrategy],
        }).compile();

        strategy = module.get<JwtStrategy>(JwtStrategy);
    });

    it('should be defined', () => {
        expect(strategy).toBeDefined();
    });

    describe('validate', () => {
        it('should return user object with userId and email', async () => {
            const payload = {
                userId: 'test-user-id',
                email: 'test@example.com',
            };

            const result = await strategy.validate(payload);

            expect(result).toEqual({
                userId: 'test-user-id',
                email: 'test@example.com',
            });
        });

        it('should extract only userId and email from payload', async () => {
            const payload = {
                userId: 'user-123',
                email: 'user@test.com',
                iat: 1234567890,
                exp: 1234567890,
                someOtherField: 'should not be included',
            };

            const result = await strategy.validate(payload);

            expect(result).toEqual({
                userId: 'user-123',
                email: 'user@test.com',
            });
            expect(result).not.toHaveProperty('iat');
            expect(result).not.toHaveProperty('exp');
            expect(result).not.toHaveProperty('someOtherField');
        });
    });
});
