import { Injectable } from "@nestjs/common";

@Injectable()
export class Response {
    public success: boolean;
    public message: string;
    public data: any;

    constructor() {}

    public initResponse(success: boolean, message: string, data: any): Response {
        this.success = success;
        this.message = message;
        this.data = data;
        return this;
    }
}
