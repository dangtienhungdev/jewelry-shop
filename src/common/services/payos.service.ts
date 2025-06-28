import { Injectable, Logger } from '@nestjs/common';

export interface PayOSPaymentData {
  orderCode: number;
  amount: number;
  description: string;
  orderId?: string; // MongoDB ObjectId of the order
  returnUrl?: string;
  cancelUrl?: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  buyerAddress?: string;
  items?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface PayOSPaymentResponse {
  error: number;
  message: string;
  data?: {
    bin: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    description: string;
    orderCode: number;
    currency: string;
    paymentLinkId: string;
    status: string;
    checkoutUrl: string;
    qrCode: string;
  };
}

export interface PayOSWebhookData {
  code: string;
  desc: string;
  data: {
    orderCode: number;
    amount: number;
    description: string;
    accountNumber: string;
    reference: string;
    transactionDateTime: string;
    currency: string;
    paymentLinkId: string;
    code: string;
    desc: string;
    counterAccountBankId?: string;
    counterAccountBankName?: string;
    counterAccountName?: string;
    counterAccountNumber?: string;
    virtualAccountName?: string;
    virtualAccountNumber?: string;
  };
  signature: string;
}

@Injectable()
export class PayOSService {
  private readonly logger = new Logger(PayOSService.name);
  private payos: any;

  constructor() {
    // Initialize PayOS with credentials from user
    const PayOS = require('@payos/node');
    this.payos = new PayOS(
      'bd9101ab-46d2-4915-bb71-7ddad941e380', // Client ID
      '34f17c94-2429-4d0b-8596-fc0cd7a0dd9d', // API Key
      'd6abbd2d344d2b40356a47b8c825f8d99cb465e7f1ce332b73003d68064bcac6', // Checksum Key
    );
  }

  /**
   * Tạo link thanh toán PayOS
   */
  async createPaymentLink(
    paymentData: PayOSPaymentData,
  ): Promise<PayOSPaymentResponse> {
    try {
      this.logger.log(
        `Creating payment link for order: ${paymentData.orderCode}, orderId: ${paymentData.orderId}`,
      );

      // Build dynamic callback URLs with orderId and orderCode
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const returnUrl =
        paymentData.returnUrl ||
        this.buildCallbackUrl(
          baseUrl,
          'success',
          paymentData.orderId,
          paymentData.orderCode,
        );
      const cancelUrl =
        paymentData.cancelUrl ||
        this.buildCallbackUrl(
          baseUrl,
          'cancel',
          paymentData.orderId,
          paymentData.orderCode,
        );

      const body = {
        orderCode: paymentData.orderCode,
        amount: paymentData.amount,
        description: paymentData.description,
        returnUrl,
        cancelUrl,
        signature: '',
        items: paymentData.items || [
          {
            name: paymentData.description,
            quantity: 1,
            price: paymentData.amount,
          },
        ],
        buyerName: paymentData.buyerName,
        buyerEmail: paymentData.buyerEmail,
        buyerPhone: paymentData.buyerPhone,
        buyerAddress: paymentData.buyerAddress,
      };

      this.logger.log(
        `PayOS callback URLs - Return: ${returnUrl}, Cancel: ${cancelUrl}`,
      );

      const paymentLinkResponse = await this.payos.createPaymentLink(body);

      this.logger.log(
        `Payment link created successfully: ${paymentLinkResponse.checkoutUrl}`,
      );

      return {
        error: 0,
        message: 'Success',
        data: paymentLinkResponse,
      };
    } catch (error) {
      this.logger.error(
        `Failed to create payment link: ${error.message}`,
        error.stack,
      );
      return {
        error: 1,
        message: error.message || 'Tạo link thanh toán thất bại',
      };
    }
  }

  /**
   * Build callback URL with orderId and orderCode parameters
   */
  private buildCallbackUrl(
    baseUrl: string,
    type: 'success' | 'cancel',
    orderId?: string,
    orderCode?: number,
  ): string {
    let url = `${baseUrl}/payment/${type}`;

    const params = new URLSearchParams();
    if (orderId) {
      params.append('orderId', orderId);
    }
    if (orderCode) {
      params.append('orderCode', orderCode.toString());
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    return url;
  }

  /**
   * Lấy thông tin thanh toán theo order code
   */
  async getPaymentLinkInformation(orderCode: number) {
    try {
      this.logger.log(`Getting payment info for order: ${orderCode}`);

      const paymentLinkInformation =
        await this.payos.getPaymentLinkInformation(orderCode);

      return {
        error: 0,
        message: 'Success',
        data: paymentLinkInformation,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get payment info: ${error.message}`,
        error.stack,
      );
      return {
        error: 1,
        message: error.message || 'Lấy thông tin thanh toán thất bại',
        data: null,
      };
    }
  }

  /**
   * Hủy link thanh toán
   */
  async cancelPaymentLink(orderCode: number) {
    try {
      this.logger.log(`Cancelling payment link for order: ${orderCode}`);

      const cancelledPaymentLinkInfo =
        await this.payos.cancelPaymentLink(orderCode);

      return {
        error: 0,
        message: 'Payment link cancelled successfully',
        data: cancelledPaymentLinkInfo,
      };
    } catch (error) {
      this.logger.error(
        `Failed to cancel payment link: ${error.message}`,
        error.stack,
      );
      return {
        error: 1,
        message: error.message || 'Hủy link thanh toán thất bại',
        data: null,
      };
    }
  }

  /**
   * Xác minh webhook signature
   */
  verifyPaymentWebhookData(webhookData: any): boolean {
    try {
      const verifiedData = this.payos.verifyPaymentWebhookData(webhookData);
      return verifiedData !== null;
    } catch (error) {
      this.logger.error(
        `Webhook verification failed: ${error.message}`,
        error.stack,
      );
      return false;
    }
  }

  /**
   * Generate order code cho PayOS (phải là số nguyên)
   */
  generateOrderCode(): number {
    return Math.floor(Math.random() * 9000000000) + 1000000000;
  }

  /**
   * Format tiền tệ VND
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }
}
