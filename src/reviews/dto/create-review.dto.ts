import { IsString, IsNumber, IsMongoId, IsOptional, Min, Max, MaxLength, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'Product ID to review' })
  @IsMongoId()
  productId: string;

  @ApiProperty({ description: 'Order ID that contains this product' })
  @IsMongoId()
  orderId: string;

  @ApiProperty({ description: 'Rating from 1 to 5 stars', minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Review title', maxLength: 200 })
  @IsString()
  @MaxLength(200)
  title: string;

  @ApiProperty({ description: 'Review comment', maxLength: 1000 })
  @IsString()
  @MaxLength(1000)
  comment: string;

  @ApiProperty({ description: 'Review images (optional)', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
