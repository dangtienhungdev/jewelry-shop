import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  productId: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  rating: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  comment: string;

  @ApiProperty()
  reviewDate: Date;

  @ApiProperty()
  isApproved: boolean;

  @ApiProperty({ required: false })
  approvedBy?: string;

  @ApiProperty({ required: false })
  approvedAt?: Date;

  @ApiProperty({ required: false })
  response?: string;

  @ApiProperty({ required: false })
  responseDate?: Date;

  @ApiProperty()
  helpfulCount: number;

  @ApiProperty()
  isVerifiedPurchase: boolean;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // Populated customer info
  @ApiProperty({ required: false })
  customer?: {
    _id: string;
    fullName: string;
  };

  // Populated product info
  @ApiProperty({ required: false })
  product?: {
    _id: string;
    productName: string;
  };
}

export class ReviewsResponseDto {
  @ApiProperty({ type: [ReviewResponseDto] })
  reviews: ReviewResponseDto[];
  
  @ApiProperty()
  total: number;
  
  @ApiProperty()
  page: number;
  
  @ApiProperty()
  limit: number;
  
  @ApiProperty()
  totalPages: number;
}
