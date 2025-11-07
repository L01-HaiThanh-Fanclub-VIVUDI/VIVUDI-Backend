import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { LocationType } from '../../../common/contants';

export class CreatePositionDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  longtitude: number;

  @IsNumber()
  lattitude: number;

  @IsEnum(LocationType)
  type: LocationType;
}
