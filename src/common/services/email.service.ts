import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
    async sendPasswordResetEmail(email: string, otp: string) {
        console.log(`Sending password reset OTP ${otp} to ${email}`);
        // TODO: Implement actual email sending logic
    }

    async sendPasswordResetSuccessEmail(email: string) {
        console.log(`Sending password reset success email to ${email}`);
        // TODO: Implement actual email sending logic
    }
}
