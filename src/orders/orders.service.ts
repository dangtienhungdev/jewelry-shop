import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../common/enums/order-status.enum';
import { PayOSService } from '../common/services/payos.service';
import { VouchersService } from '../vouchers/vouchers.service';
import { ConfirmPaymentDto } from './dto/confirm-payment.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order, OrderDocument } from './schemas/order.schema';
import { Payment, PaymentDocument } from './schemas/payment.schema';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    private payosService: PayOSService,
    private vouchersService: VouchersService,
  ) {}

  /**
   * Tạo đơn hàng mới
   */
  async create(createOrderDto: CreateOrderDto): Promise<{
    order: Order;
    paymentUrl?: string;
    message: string;
  }> {
    try {
      this.logger.log(
        `Creating order for customer: ${createOrderDto.customerId}`,
      );

      // Tính toán tổng tiền từ order details
      const totalAmount = createOrderDto.orderDetails.reduce(
        (sum, item) => sum + item.priceAtPurchase * item.quantity,
        0,
      );

      let discountAmount = 0;
      let appliedDiscounts: { discountId: any; discountAmount: number }[] = [];

      // Validate và áp dụng voucher nếu có
      if (createOrderDto.voucherCode) {
        const voucherValidation = await this.vouchersService.validateVoucher({
          voucherCode: createOrderDto.voucherCode,
          orderValue: totalAmount,
        });

        if (!voucherValidation.isValid) {
          throw new BadRequestException(voucherValidation.message);
        }

        discountAmount = voucherValidation.discountAmount || 0;
        appliedDiscounts = [
          {
            discountId: voucherValidation.voucher?._id,
            discountAmount,
          },
        ];
      }

      const shippingFee = createOrderDto.shippingFee || 0;
      const finalAmount = totalAmount - discountAmount + shippingFee;

      // Tạo đơn hàng
      const order = new this.orderModel({
        customerId: createOrderDto.customerId,
        orderDetails: createOrderDto.orderDetails,
        totalAmount,
        discountAmount,
        finalAmount,
        shippingFee,
        shippingAddress: createOrderDto.shippingAddress,
        recipientName: createOrderDto.recipientName,
        recipientPhone: createOrderDto.recipientPhone,
        notes: createOrderDto.notes,
        appliedDiscounts,
        status: OrderStatus.PENDING,
      });

      const savedOrder = await order.save();
      this.logger.log(`Order created with ID: ${savedOrder._id}`);

      // Nếu có voucher, tăng số lần sử dụng
      if (createOrderDto.voucherCode && appliedDiscounts.length > 0) {
        await this.vouchersService.useVoucher(appliedDiscounts[0].discountId);
      }

      // Xử lý thanh toán
      let paymentUrl: string | undefined;

      if (createOrderDto.paymentMethod === PaymentMethod.PAYOS) {
        // Tạo thanh toán PayOS
        const paymentResult = await this.createPayOSPayment(savedOrder);

        if (paymentResult.success) {
          paymentUrl = paymentResult.paymentUrl;
        } else {
          this.logger.error(`PayOS payment failed: ${paymentResult.message}`);
          // Có thể rollback order nếu cần
        }
      } else {
        // Thanh toán tiền mặt - tạo payment record
        await this.createCashPayment(savedOrder);
      }

      return {
        order: savedOrder,
        paymentUrl,
        message:
          createOrderDto.paymentMethod === PaymentMethod.PAYOS
            ? 'Đơn hàng đã được tạo. Vui lòng thanh toán qua link PayOS.'
            : 'Đơn hàng đã được tạo thành công. Thanh toán khi nhận hàng.',
      };
    } catch (error) {
      this.logger.error(
        `Failed to create order: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Tạo thanh toán PayOS
   */
  private async createPayOSPayment(order: Order): Promise<{
    success: boolean;
    paymentUrl?: string;
    message: string;
    payment?: Payment;
  }> {
    try {
      const payosOrderCode = this.payosService.generateOrderCode();

      // Tạo payment record
      const payment = new this.paymentModel({
        orderId: order._id,
        paymentMethod: PaymentMethod.PAYOS,
        amount: order.finalAmount,
        status: PaymentStatus.PENDING,
        payosOrderId: payosOrderCode,
      });

      const savedPayment = await payment.save();

      // Tạo PayOS payment link với orderId
      const payosResponse = await this.payosService.createPaymentLink({
        orderCode: payosOrderCode,
        amount: order.finalAmount,
        description: `${order.orderCode}`,
        orderId: order._id.toString(), // Pass MongoDB ObjectId as string
        buyerName: order.recipientName,
        buyerPhone: order.recipientPhone,
        buyerAddress: order.shippingAddress,
        items: order.orderDetails.map((item) => ({
          name: `Sản phẩm ${item.productId}`,
          quantity: item.quantity,
          price: item.priceAtPurchase,
        })),
      });

      if (payosResponse.error === 0 && payosResponse.data) {
        // Cập nhật payment với PayOS data
        savedPayment.payosPaymentLinkId = payosResponse.data.paymentLinkId;
        savedPayment.transactionCode = payosResponse.data.paymentLinkId;
        await savedPayment.save();

        this.logger.log(
          `PayOS payment created for order ${order._id}, paymentUrl: ${payosResponse.data.checkoutUrl}`,
        );

        return {
          success: true,
          paymentUrl: payosResponse.data.checkoutUrl,
          message: 'PayOS payment link created successfully',
          payment: savedPayment,
        };
      } else {
        savedPayment.status = PaymentStatus.FAILED;
        savedPayment.notes = payosResponse.message;
        await savedPayment.save();

        return {
          success: false,
          message: payosResponse.message || 'Failed to create PayOS payment',
        };
      }
    } catch (error) {
      this.logger.error(
        `PayOS payment creation failed: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: error.message || 'PayOS payment creation failed',
      };
    }
  }

  /**
   * Tạo thanh toán tiền mặt
   */
  private async createCashPayment(order: Order): Promise<Payment> {
    const payment = new this.paymentModel({
      orderId: order._id,
      paymentMethod: PaymentMethod.CASH,
      amount: order.finalAmount,
      status: PaymentStatus.PENDING,
      notes: 'Thanh toán khi nhận hàng',
    });

    return await payment.save();
  }

  /**
   * Lấy danh sách đơn hàng với filter và pagination
   */
  async findAll(query: any = {}): Promise<{ orders: Order[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      status,
      customerId,
      search,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = query;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (customerId) {
      filter.customerId = customerId;
    }

    if (search) {
      filter.$or = [
        { orderCode: { $regex: search, $options: 'i' } },
        { recipientName: { $regex: search, $options: 'i' } },
        { recipientPhone: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;
    const sort: any = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(Number(limit))
        .populate('customerId', 'fullName email phone')
        .populate('processedBy', 'username email')
        .exec(),
      this.orderModel.countDocuments(filter),
    ]);

    return { orders, total };
  }

  /**
   * Lấy đơn hàng theo ID
   */
  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate('customerId', 'fullName email phone address')
      .populate('processedBy', 'username email')
      .exec();

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    return order;
  }

  /**
   * Cập nhật trạng thái đơn hàng
   */
  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.orderModel
      .findByIdAndUpdate(id, updateOrderDto, { new: true })
      .populate('customerId', 'fullName email phone')
      .populate('processedBy', 'username email')
      .exec();

    if (!order) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    this.logger.log(`Order ${id} updated. New status: ${order.status}`);

    return order;
  }

  /**
   * Hủy đơn hàng
   */
  async cancelOrder(id: string, reason?: string): Promise<Order> {
    const order = await this.findOne(id);

    // Check if order is already in a final state
    if (order.status === OrderStatus.SUCCESS) {
      throw new BadRequestException('Không thể hủy đơn hàng đã hoàn thành');
    }

    // If order is already failed/cancelled, return it as-is (idempotent operation)
    if (order.status === OrderStatus.FAILED) {
      this.logger.log(
        `Order ${id} is already cancelled/failed, returning existing order`,
      );
      return order;
    }

    // Hủy PayOS payment nếu có
    const payment = await this.paymentModel.findOne({ orderId: id }).exec();
    if (
      payment &&
      payment.paymentMethod === PaymentMethod.PAYOS &&
      payment.payosOrderId &&
      payment.status !== PaymentStatus.CANCELLED
    ) {
      await this.payosService.cancelPaymentLink(payment.payosOrderId);
      payment.status = PaymentStatus.CANCELLED;
      payment.notes = reason || 'Đơn hàng bị hủy';
      await payment.save();
    }

    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(
        id,
        {
          status: OrderStatus.FAILED,
          notes: reason || 'Đơn hàng bị hủy',
        },
        { new: true },
      )
      .populate('customerId', 'fullName email phone')
      .populate('processedBy', 'username email')
      .exec();

    this.logger.log(`Order ${id} cancelled successfully`);
    return updatedOrder!;
  }

  /**
   * Xử lý webhook PayOS
   */
  async handlePayOSWebhook(webhookData: any): Promise<void> {
    try {
      this.logger.log('Processing PayOS webhook', JSON.stringify(webhookData));

      // Verify webhook
      if (!this.payosService.verifyPaymentWebhookData(webhookData)) {
        throw new BadRequestException('Invalid webhook signature');
      }

      const { orderCode, amount, code, desc } = webhookData.data;

      // Tìm payment record
      const payment = await this.paymentModel
        .findOne({ payosOrderId: orderCode })
        .exec();

      if (!payment) {
        this.logger.error(`Payment not found for orderCode: ${orderCode}`);
        return;
      }

      // Tìm order
      const order = await this.orderModel.findById(payment.orderId).exec();
      if (!order) {
        this.logger.error(`Order not found for payment: ${payment._id}`);
        return;
      }

      // Cập nhật payment status
      if (code === '00') {
        // Thanh toán thành công
        payment.status = PaymentStatus.COMPLETED;
        payment.notes = 'Thanh toán PayOS thành công';
        order.status = OrderStatus.CONFIRMED;

        this.logger.log(`Payment successful for order ${order.orderCode}`);
      } else {
        // Thanh toán thất bại
        payment.status = PaymentStatus.FAILED;
        payment.notes = desc || 'Thanh toán PayOS thất bại';
        order.status = OrderStatus.FAILED;

        this.logger.log(`Payment failed for order ${order.orderCode}: ${desc}`);
      }

      await Promise.all([payment.save(), order.save()]);
    } catch (error) {
      this.logger.error(
        `PayOS webhook processing failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Lấy payments của một đơn hàng
   */
  async getOrderPayments(orderId: string): Promise<Payment[]> {
    return await this.paymentModel
      .find({ orderId })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Xóa đơn hàng (soft delete)
   */
  async remove(id: string): Promise<void> {
    const result = await this.orderModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    this.logger.log(`Order ${id} deleted`);
  }

  /**
   * Thống kê đơn hàng
   */
  async getOrderStats(query: any = {}): Promise<any> {
    const { startDate, endDate } = query;
    const filter: any = {};

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const stats = await this.orderModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$finalAmount' },
        },
      },
    ]);

    const totalOrders = await this.orderModel.countDocuments(filter);
    const totalRevenue = await this.orderModel.aggregate([
      { $match: { ...filter, status: OrderStatus.SUCCESS } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } },
    ]);

    return {
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      statusBreakdown: stats,
    };
  }

  /**
   * Confirm payment success từ frontend callback
   */
  async confirmPayment(confirmPaymentDto: ConfirmPaymentDto): Promise<{
    order: Order;
    payment?: Payment;
    message: string;
  }> {
    try {
      this.logger.log(
        `Confirming payment for order: ${confirmPaymentDto.orderId}`,
      );

      // Tìm order (có thể là ObjectId hoặc orderCode)
      let order: Order;
      try {
        // Try to find by ObjectId first
        order = await this.findOne(confirmPaymentDto.orderId);
      } catch {
        // If not found by ObjectId, try to find by orderCode
        const orderByCode = await this.orderModel
          .findOne({ orderCode: confirmPaymentDto.orderId })
          .populate('customerId', 'fullName email phone address')
          .populate('processedBy', 'username email')
          .exec();

        if (!orderByCode) {
          throw new NotFoundException('Không tìm thấy đơn hàng');
        }
        order = orderByCode;
      }

      // Kiểm tra trạng thái đơn hàng
      if (order.status === OrderStatus.SUCCESS) {
        this.logger.log(`Order ${order._id} already confirmed as success`);
        const payment = await this.paymentModel
          .findOne({ orderId: order._id })
          .exec();
        return {
          order,
          payment: payment || undefined,
          message: 'Đơn hàng đã được xác nhận thanh toán thành công trước đó',
        };
      }

      if (order.status === OrderStatus.FAILED) {
        throw new BadRequestException(
          'Không thể xác nhận thanh toán cho đơn hàng đã bị hủy',
        );
      }

      // Tìm payment record
      const payment = await this.paymentModel
        .findOne({ orderId: order._id })
        .exec();

      if (!payment) {
        throw new NotFoundException('Không tìm thấy thông tin thanh toán');
      }

      // Chỉ cho phép confirm PayOS payments
      if (payment.paymentMethod !== PaymentMethod.PAYOS) {
        throw new BadRequestException('Chỉ có thể xác nhận thanh toán PayOS');
      }

      // Kiểm tra trạng thái payment
      if (payment.status === PaymentStatus.COMPLETED) {
        this.logger.log(`Payment ${payment._id} already completed`);
        return {
          order,
          payment,
          message: 'Thanh toán đã được xác nhận thành công trước đó',
        };
      }

      if (
        payment.status === PaymentStatus.FAILED ||
        payment.status === PaymentStatus.CANCELLED
      ) {
        throw new BadRequestException(
          'Không thể xác nhận thanh toán đã thất bại hoặc bị hủy',
        );
      }

      // Validate with PayOS to double-check (optional but recommended)
      if (payment.payosOrderId) {
        try {
          const payosInfo = await this.payosService.getPaymentLinkInformation(
            payment.payosOrderId,
          );
          if (payosInfo.error === 0 && payosInfo.data) {
            this.logger.log(
              `PayOS validation successful for order ${payment.payosOrderId}`,
            );
          }
        } catch (payosError) {
          this.logger.warn(
            `PayOS validation failed, but proceeding with confirmation: ${payosError.message}`,
          );
        }
      }

      // Update payment status
      payment.status = PaymentStatus.COMPLETED;
      payment.notes =
        confirmPaymentDto.notes || 'Thanh toán xác nhận từ frontend callback';
      if (confirmPaymentDto.transactionId) {
        payment.transactionCode = confirmPaymentDto.transactionId;
      }
      payment.paymentDate = new Date();

      // Update order status
      const updatedOrder = await this.orderModel
        .findByIdAndUpdate(
          order._id,
          {
            status: OrderStatus.CONFIRMED,
            notes: order.notes || 'Thanh toán PayOS thành công',
          },
          { new: true },
        )
        .populate('customerId', 'fullName email phone address')
        .populate('processedBy', 'username email')
        .exec();

      // Save payment update
      await payment.save();

      this.logger.log(
        `Payment confirmed successfully for order ${order.orderCode}`,
      );

      return {
        order: updatedOrder!,
        payment,
        message: 'Xác nhận thanh toán thành công',
      };
    } catch (error) {
      this.logger.error(
        `Payment confirmation failed: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
