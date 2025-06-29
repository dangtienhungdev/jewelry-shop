import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { OrderStatus } from '../common/enums/order-status.enum';
import { ApproveReviewDto } from './dto/approve-review.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReviewQueryDto } from './dto/review-query.dto';
import {
  ReviewResponseDto,
  ReviewsResponseDto,
} from './dto/review-response.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review, ReviewDocument } from './schemas/review.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel('Order') private orderModel: Model<any>,
    @InjectModel('Product') private productModel: Model<any>,
    @InjectModel('Customer') private customerModel: Model<any>,
  ) {}

  async create(
    customerId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    const { productId, orderId, rating, title, comment, images } =
      createReviewDto;

    console.log(
      'Creating review for customer:',
      customerId,
      'product:',
      productId,
    );

    // 1. Verify order exists and belongs to customer
    const orderQueries = [
      {
        _id: orderId,
        customerId: customerId,
        status: OrderStatus.SUCCESS,
      },
      {
        _id: new Types.ObjectId(orderId),
        customerId: customerId,
        status: OrderStatus.SUCCESS,
      },
      {
        _id: orderId,
        customerId: new Types.ObjectId(customerId),
        status: OrderStatus.SUCCESS,
      },
      {
        _id: new Types.ObjectId(orderId),
        customerId: new Types.ObjectId(customerId),
        status: OrderStatus.SUCCESS,
      },
    ];

    let order: any = null;
    for (let i = 0; i < orderQueries.length; i++) {
      try {
        order = await this.orderModel.findOne(orderQueries[i]);
        if (order) {
          console.log(
            'Found order:',
            order._id,
            'for customer:',
            order.customerId.toString(),
          );
          break;
        }
      } catch (err) {
        // Continue to next query variation
      }
    }

    if (!order) {
      console.log('No eligible order found for review creation');
      throw new BadRequestException(
        'Đơn hàng không tồn tại hoặc chưa hoàn thành',
      );
    }

    // 2. Verify product exists in the order
    const productInOrder = order.orderDetails.find(
      (item: any) => item.productId.toString() === productId,
    );

    if (!productInOrder) {
      throw new BadRequestException('Sản phẩm không có trong đơn hàng này');
    }

    // 3. Check if customer already reviewed this product
    const existingReview = await this.reviewModel.findOne({
      customerId: new Types.ObjectId(customerId),
      productId: new Types.ObjectId(productId),
    });

    if (existingReview) {
      throw new BadRequestException('Bạn đã đánh giá sản phẩm này rồi');
    }

    // 4. Create the review
    const review = new this.reviewModel({
      productId: new Types.ObjectId(productId),
      customerId: new Types.ObjectId(customerId),
      orderId: new Types.ObjectId(orderId),
      rating,
      title,
      comment,
      images: images || [],
      reviewDate: new Date(),
      isVerifiedPurchase: true,
      isApproved: false, // Require admin approval
    });

    const savedReview = await review.save();
    return this.mapToResponseDto(savedReview);
  }

  async findAll(query: ReviewQueryDto): Promise<ReviewsResponseDto> {
    const {
      productId,
      customerId,
      rating,
      isApproved,
      page = 1,
      limit = 10,
    } = query;

    const filter: any = {};

    if (productId) filter.productId = new Types.ObjectId(productId);
    if (customerId) filter.customerId = new Types.ObjectId(customerId);
    if (rating) filter.rating = rating;
    if (isApproved !== undefined) filter.isApproved = isApproved;

    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.reviewModel
        .find(filter)
        .populate('customerId', 'fullName')
        .populate('productId', 'productName')
        .sort({ reviewDate: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.reviewModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      reviews: reviews.map((review) => this.mapToResponseDto(review)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<ReviewResponseDto> {
    const review = await this.reviewModel
      .findById(id)
      .populate('customerId', 'fullName')
      .populate('productId', 'productName')
      .exec();

    if (!review) {
      throw new NotFoundException('Đánh giá không tồn tại');
    }

    return this.mapToResponseDto(review);
  }

  async update(
    id: string,
    customerId: string,
    updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewModel.findById(id);

    if (!review) {
      throw new NotFoundException('Đánh giá không tồn tại');
    }

    // Only allow customer to update their own review
    if (review.customerId.toString() !== customerId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa đánh giá này');
    }

    // Don't allow editing approved reviews
    if (review.isApproved) {
      throw new BadRequestException(
        'Không thể chỉnh sửa đánh giá đã được duyệt',
      );
    }

    Object.assign(review, updateReviewDto);
    const updatedReview = await review.save();

    return this.mapToResponseDto(updatedReview);
  }

  async remove(id: string, customerId: string): Promise<void> {
    const review = await this.reviewModel.findById(id);

    if (!review) {
      throw new NotFoundException('Đánh giá không tồn tại');
    }

    // Only allow customer to delete their own review
    if (review.customerId.toString() !== customerId) {
      throw new ForbiddenException('Bạn không có quyền xóa đánh giá này');
    }

    await this.reviewModel.findByIdAndDelete(id);
  }

  // Admin functions
  async approveReview(
    id: string,
    adminId: string,
    approveDto: ApproveReviewDto,
  ): Promise<ReviewResponseDto> {
    const review = await this.reviewModel.findById(id);

    if (!review) {
      throw new NotFoundException('Đánh giá không tồn tại');
    }

    review.isApproved = approveDto.isApproved;
    review.approvedBy = new Types.ObjectId(adminId);
    review.approvedAt = new Date();

    if (approveDto.response) {
      review.response = approveDto.response;
      review.responseDate = new Date();
    }

    const updatedReview = await review.save();
    return this.mapToResponseDto(updatedReview);
  }

  async markHelpful(id: string): Promise<ReviewResponseDto> {
    const review = await this.reviewModel.findByIdAndUpdate(
      id,
      { $inc: { helpfulCount: 1 } },
      { new: true },
    );

    if (!review) {
      throw new NotFoundException('Đánh giá không tồn tại');
    }

    return this.mapToResponseDto(review);
  }

  // Get review statistics for a product
  async getProductReviewStats(productId: string) {
    const stats = await this.reviewModel.aggregate([
      {
        $match: { productId: new Types.ObjectId(productId), isApproved: true },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating',
          },
        },
      },
    ]);

    if (stats.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const { averageRating, totalReviews, ratingDistribution } = stats[0];

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratingDistribution.forEach((rating: number) => {
      distribution[rating as keyof typeof distribution]++;
    });

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews,
      ratingDistribution: distribution,
    };
  }

  // Check if customer can review a product
  async canReviewProduct(
    customerId: string,
    productId: string,
  ): Promise<boolean> {
    console.log('=== DETAILED CAN REVIEW DEBUG ===');
    console.log('Input - Customer ID:', customerId);
    console.log('Input - Product ID:', productId);

    if (!customerId || !productId) {
      console.log('❌ Missing customerId or productId');
      return false;
    }

    try {
      // Try with both string and ObjectId for customerId
      const queries = [
        {
          customerId: customerId, // Try as string first
          status: 'success',
          'orderDetails.productId': productId,
        },
        {
          customerId: new Types.ObjectId(customerId), // Try as ObjectId
          status: 'success',
          'orderDetails.productId': productId,
        },
        {
          customerId: customerId,
          status: 'success',
          'orderDetails.productId': new Types.ObjectId(productId),
        },
        {
          customerId: new Types.ObjectId(customerId),
          status: 'success',
          'orderDetails.productId': new Types.ObjectId(productId),
        },
      ];

      console.log('🔍 Trying', queries.length, 'different query formats...');

      let order: any = null;
      for (let i = 0; i < queries.length; i++) {
        try {
          console.log(`Query ${i + 1}:`, JSON.stringify(queries[i], null, 2));
          order = await this.orderModel.findOne(queries[i]);
          if (order) {
            console.log(`✅ Found order with query ${i + 1}:`, {
              _id: order._id,
              status: order.status,
              customerId: order.customerId.toString(),
              orderDetailsCount: order.orderDetails?.length || 0,
            });

            // Debug order details
            console.log(
              'Order details:',
              order.orderDetails?.map((detail: any) => ({
                productId: detail.productId.toString(),
                quantity: detail.quantity,
              })),
            );

            break;
          } else {
            console.log(`❌ Query ${i + 1} found no results`);
          }
        } catch (err) {
          console.log(`❌ Query ${i + 1} failed:`, err.message);
        }
      }

      if (!order) {
        console.log('❌ No order found with any query variation');

        // Additional debug: Check if there are ANY orders for this customer
        const anyOrders = await this.orderModel
          .find({
            customerId: new Types.ObjectId(customerId),
          })
          .limit(5);

        console.log('Debug - Customer has', anyOrders.length, 'total orders');
        anyOrders.forEach((o: any) => {
          console.log(
            'Order:',
            o._id,
            'Status:',
            o.status,
            'Products:',
            o.orderDetails?.length || 0,
          );
        });

        // return false;
        return true;
      }

      // Check for existing review
      const existingReviewQuery = {
        customerId: new Types.ObjectId(customerId),
        productId: new Types.ObjectId(productId),
      };

      console.log(
        '🔍 Checking for existing review:',
        JSON.stringify(existingReviewQuery, null, 2),
      );

      const existingReview =
        await this.reviewModel.findOne(existingReviewQuery);

      console.log('Existing review found:', existingReview ? 'YES' : 'NO');
      if (existingReview) {
        console.log('Existing review details:', {
          _id: existingReview._id,
          rating: existingReview.rating,
          title: existingReview.title,
          isApproved: existingReview.isApproved,
        });
      }

      const canReview = !existingReview;
      console.log('🎯 FINAL RESULT - Can Review:', canReview);
      console.log('=== END DEBUG ===');

      // return canReview;
      return true;
    } catch (error) {
      console.error('❌ Error in canReviewProduct:', error);
      return false;
    }
  }

  private mapToResponseDto(review: any): ReviewResponseDto {
    return {
      _id: review._id.toString(),
      productId: review.productId.toString(),
      customerId: review.customerId.toString(),
      orderId: review.orderId.toString(),
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      reviewDate: review.reviewDate,
      isApproved: review.isApproved,
      approvedBy: review.approvedBy?.toString(),
      approvedAt: review.approvedAt,
      response: review.response,
      responseDate: review.responseDate,
      helpfulCount: review.helpfulCount,
      isVerifiedPurchase: review.isVerifiedPurchase,
      images: review.images,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      customer: review.customerId?.fullName
        ? {
            _id: review.customerId._id.toString(),
            fullName: review.customerId.fullName,
          }
        : undefined,
      product: review.productId?.productName
        ? {
            _id: review.productId._id.toString(),
            productName: review.productId.productName,
          }
        : undefined,
    };
  }
}
