import { Document, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', required: true })
  orderId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true, maxlength: 200 })
  title: string;

  @Prop({ required: true, maxlength: 1000 })
  comment: string;

  @Prop({ default: Date.now })
  reviewDate: Date;

  @Prop({ default: false })
  isApproved: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Admin', default: null })
  approvedBy: Types.ObjectId;

  @Prop({ default: null })
  approvedAt: Date;

  @Prop({ maxlength: 500, default: null })
  response: string;

  @Prop({ default: null })
  responseDate: Date;

  // Additional fields for better functionality
  @Prop({ default: 0 })
  helpfulCount: number;

  @Prop({ default: false })
  isVerifiedPurchase: boolean;

  @Prop([String])
  images: string[];
}

export const ReviewSchema = SchemaFactory.createForClass(Review);

// Indexes for better performance
ReviewSchema.index({ productId: 1, customerId: 1 }, { unique: true }); // One review per customer per product
ReviewSchema.index({ productId: 1, isApproved: 1 });
ReviewSchema.index({ customerId: 1 });
ReviewSchema.index({ reviewDate: -1 });
ReviewSchema.index({ rating: 1 });
