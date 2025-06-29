import { PartialType } from '@nestjs/swagger';
import { CreateReviewDto } from './create-review.dto';
import { IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @ApiProperty({ description: 'Mark review as helpful', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  helpfulCount?: number;
}
