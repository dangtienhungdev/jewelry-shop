import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApproveReviewDto } from './dto/approve-review.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import {
  ReviewResponseDto,
  ReviewsResponseDto,
} from './dto/review-response.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new review (Customer only)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Review created successfully',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input or business rule violation',
  })
  async create(
    @Request() req: any,
    @Body() createReviewDto: CreateReviewDto & { customerId?: string },
  ): Promise<ReviewResponseDto> {
    // Use customerId from body if provided, otherwise from JWT token
    const customerId =
      createReviewDto.customerId || req.user?.customerId || req.user?.userId;

    if (!customerId) {
      throw new BadRequestException('Customer ID is required');
    }

    const { customerId: _, ...reviewData } = createReviewDto;
    return this.reviewsService.create(customerId, reviewData);
  }

  @Get()
  @ApiOperation({ summary: 'Get all reviews with filters' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Reviews retrieved successfully',
    type: ReviewsResponseDto,
  })
  async findAll(@Query() query: ReviewQueryDto): Promise<ReviewsResponseDto> {
    return this.reviewsService.findAll(query);
  }

  @Get('product/:productId/stats')
  @ApiOperation({ summary: 'Get review statistics for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Product review statistics',
  })
  async getProductStats(@Param('productId') productId: string) {
    return this.reviewsService.getProductReviewStats(productId);
  }

  @Post('can-review/:productId')
  @ApiOperation({ summary: 'Check if customer can review a product' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Can review check result',
  })
  async canReviewProduct(
    @Param('productId') productId: string,
    @Body() body: { customerId: string },
  ) {
    const customerId = body.customerId;

    if (!customerId) {
      return { canReview: false, error: 'Customer ID is required' };
    }

    const canReview = await this.reviewsService.canReviewProduct(
      customerId,
      productId,
    );
    console.log('🚀 ~ ReviewsController ~ canReview:', canReview);
    return { canReview };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a review by ID' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Review retrieved successfully',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Review not found',
  })
  async findOne(@Param('id') id: string): Promise<ReviewResponseDto> {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a review (Customer only - own reviews)' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Review updated successfully',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not allowed to update this review',
  })
  @ApiBearerAuth()
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    const customerId = req.user?.customerId || req.user?.userId;
    return this.reviewsService.update(id, customerId, updateReviewDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a review (Customer only - own reviews)' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Review deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Not allowed to delete this review',
  })
  @ApiBearerAuth()
  async remove(@Param('id') id: string, @Request() req: any): Promise<void> {
    const customerId = req.user?.customerId || req.user?.userId;
    return this.reviewsService.remove(id, customerId);
  }

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve or reject a review (Admin only)' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Review approval status updated',
    type: ReviewResponseDto,
  })
  @ApiBearerAuth()
  async approveReview(
    @Param('id') id: string,
    @Request() req: any,
    @Body() approveDto: ApproveReviewDto,
  ): Promise<ReviewResponseDto> {
    const adminId = req.user?.adminId || req.user?.userId;
    return this.reviewsService.approveReview(id, adminId, approveDto);
  }

  @Patch(':id/helpful')
  @ApiOperation({ summary: 'Mark a review as helpful' })
  @ApiParam({ name: 'id', description: 'Review ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Review marked as helpful',
    type: ReviewResponseDto,
  })
  async markHelpful(@Param('id') id: string): Promise<ReviewResponseDto> {
    return this.reviewsService.markHelpful(id);
  }

  // DEBUG ENDPOINT - Returns debug info in response
  @Post('debug-can-review/:productId')
  @ApiOperation({ summary: 'Debug can review with detailed info' })
  @ApiParam({ name: 'productId', description: 'Product ID' })
  async debugCanReview(
    @Param('productId') productId: string,
    @Body() body: { customerId: string },
  ) {
    const customerId = body.customerId;
    const debugInfo: any = {
      input: { customerId, productId },
      steps: [],
      result: false,
    };

    if (!customerId) {
      debugInfo.steps.push('❌ Missing customerId');
      return debugInfo;
    }

    try {
      // Check orders
      debugInfo.steps.push('🔍 Checking for orders...');

      const anyOrders = await this.reviewsService['orderModel']
        .find({
          customerId: customerId,
        })
        .limit(3);

      debugInfo.customerOrdersCount = anyOrders.length;
      debugInfo.customerOrders = anyOrders.map((o: any) => ({
        _id: o._id,
        status: o.status,
        productCount: o.orderDetails?.length || 0,
        products: o.orderDetails?.map((d: any) => d.productId.toString()) || [],
      }));

      // Try ObjectId format
      const anyOrdersObjectId = await this.reviewsService['orderModel']
        .find({
          customerId: new (require('mongoose').Types.ObjectId)(customerId),
        })
        .limit(3);

      debugInfo.customerOrdersCountObjectId = anyOrdersObjectId.length;

      // Check specific order criteria
      const targetOrder = await this.reviewsService['orderModel'].findOne({
        customerId: new (require('mongoose').Types.ObjectId)(customerId),
        status: 'success',
        'orderDetails.productId': productId,
      });

      debugInfo.targetOrderFound = !!targetOrder;
      if (targetOrder) {
        debugInfo.targetOrder = {
          _id: targetOrder._id,
          status: targetOrder.status,
          products:
            targetOrder.orderDetails?.map((d: any) => d.productId.toString()) ||
            [],
        };
      }

      // Check existing reviews
      const existingReview = await this.reviewsService['reviewModel'].findOne({
        customerId: new (require('mongoose').Types.ObjectId)(customerId),
        productId: new (require('mongoose').Types.ObjectId)(productId),
      });

      debugInfo.existingReview = !!existingReview;
      if (existingReview) {
        debugInfo.existingReviewDetails = {
          _id: existingReview._id,
          rating: existingReview.rating,
          title: existingReview.title,
        };
      }

      debugInfo.result = !!targetOrder && !existingReview;
      debugInfo.steps.push('✅ Debug analysis complete');
    } catch (error) {
      debugInfo.steps.push('❌ Error: ' + error.message);
      debugInfo.error = error.message;
    }

    return debugInfo;
  }

  // FIX TEST DATA ENDPOINT
  @Post('fix-test-data')
  @ApiOperation({ summary: 'Fix test data for review testing' })
  async fixTestData() {
    const customerId = '68600a80e6d86dea6c333965';
    const productId = '68568fe74132ecb6b851fb75';
    const orderId = '686018801bdec8d39b252f05';

    try {
      // 1. Update order status to success
      const orderModel = this.reviewsService['orderModel'];
      const updateResult = await orderModel.updateOne(
        { _id: orderId },
        { $set: { status: 'success' } },
      );

      // 2. Add product to order if not exists
      const order = await orderModel.findById(orderId);
      const hasProduct = order?.orderDetails?.some(
        (detail: any) => detail.productId.toString() === productId,
      );

      if (!hasProduct) {
        await orderModel.updateOne(
          { _id: orderId },
          {
            $push: {
              orderDetails: {
                productId: productId,
                quantity: 1,
                priceAtPurchase: 1000000,
                discountApplied: 0,
              },
            },
          },
        );
      }

      // 3. Remove existing reviews
      const reviewModel = this.reviewsService['reviewModel'];
      const deleteResult = await reviewModel.deleteMany({
        customerId: new (require('mongoose').Types.ObjectId)(customerId),
        productId: new (require('mongoose').Types.ObjectId)(productId),
      });

      return {
        success: true,
        message: 'Test data fixed',
        details: {
          orderUpdated: updateResult.modifiedCount > 0,
          reviewsRemoved: deleteResult.deletedCount,
          productAddedToOrder: !hasProduct,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
