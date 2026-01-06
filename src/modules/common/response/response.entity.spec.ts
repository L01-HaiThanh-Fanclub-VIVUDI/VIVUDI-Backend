import { Response } from './response.entity';

describe('ResponseEntity', () => {
    let response: Response;

    beforeEach(() => {
        response = new Response();
    });

    it('should initialize response correctly', () => {
        const result = response.initResponse(true, 'success', { id: 1 });
        expect(result.success).toBe(true);
        expect(result.message).toBe('success');
        expect(result.data).toEqual({ id: 1 });
    });
});
