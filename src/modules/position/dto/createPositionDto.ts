import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Is } from "sequelize-typescript";
import { LocationType } from "src/common/contants";

export class CreatePositionDto {
    
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    address: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsNotEmpty()
    @IsNumber()
    longtitude: number;

    @IsNotEmpty()
    @IsNumber()
    lattitude: number;

    @IsNotEmpty()
    @IsEnum(LocationType, { message: 'type must be value in LocationType' })
    type: LocationType;

}
