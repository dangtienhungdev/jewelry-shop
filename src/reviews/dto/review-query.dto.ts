import { IsOptional, IsMongoId, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewQueryDto {
  @ApiProperty({ required: false, description: 'Product ID to filter reviews' })
  @IsOptional()
  @IsMongoId()
  productId?: string;

  @ApiProperty({ required: false, description: 'Customer ID to filter reviews' })
  @IsOptional()
  @IsMongoId()
  customerId?: string;

  @ApiProperty({ required: false, description: 'Filter by rating' })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ required: false, description: 'Filter by approval status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isApproved?: boolean;

  @ApiProperty({ required: false, description: 'Page number', default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, description: 'Items per page', default: 10 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
