import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class ApproveReviewDto {
  @ApiProperty({ description: 'Approve or reject the review' })
  @IsBoolean()
  isApproved: boolean;

  @ApiProperty({
    description: 'Admin response to the review (optional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  response?: string;
}
