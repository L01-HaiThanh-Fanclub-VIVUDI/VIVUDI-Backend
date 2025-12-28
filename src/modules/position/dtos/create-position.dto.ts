import { IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocationType } from '../../../common/contants';

export class CreatePositionDto {
  @ApiProperty({ example: 'Ho Chi Minh City', description: 'Location name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '123 Main Street', description: 'Location address' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'A beautiful location', description: 'Location description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: LocationType, example: LocationType.RESTAURANT, description: 'Location type' })
  @IsEnum(LocationType)
  type: LocationType;

  @ApiProperty({ example: 106.6297, description: 'Longitude coordinate' })
  @IsNumber()
  longtitude: number;

  @ApiProperty({ example: 10.8231, description: 'Latitude coordinate' })
  @IsNumber()
  lattitude: number;

}
