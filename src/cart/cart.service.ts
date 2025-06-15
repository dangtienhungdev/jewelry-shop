import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { AddItemCartDto } from './dto/add-item-cart.dto';
import { CartItemDto, CartResponseDto } from './dto/cart-response.dto';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateItemCartDto } from './dto/update-item-cart.dto';
import { Cart, CartDocument } from './schemas/cart.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  /**
   * Tạo giỏ hàng mới cho khách hàng
   */
  async create(createCartDto: CreateCartDto): Promise<CartResponseDto> {
    // Kiểm tra xem khách hàng đã có giỏ hàng chưa
    const existingCart = await this.cartModel.findOne({
      customerId: createCartDto.customerId,
    });

    if (existingCart) {
      throw new BadRequestException('Khách hàng đã có giỏ hàng');
    }

    if (!Types.ObjectId.isValid(createCartDto.customerId)) {
      throw new BadRequestException('ID khách hàng không hợp lệ');
    }

    const cart = new this.cartModel({
      customerId: new Types.ObjectId(createCartDto.customerId),
      items: [],
      totalAmount: 0,
      totalItems: 0,
    });

    const savedCart = await cart.save();
    return this.mapToResponseDto(savedCart);
  }

  /**
   * Lấy giỏ hàng của khách hàng
   */
  async findByCustomerId(customerId: string): Promise<CartResponseDto> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('ID khách hàng không hợp lệ');
    }

    const cart = await this.cartModel
      .findOne({ customerId: customerId })
      .populate('items.productId')
      .exec();

    if (!cart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng');
    }

    return this.mapToResponseDto(cart);
  }

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  async addItem(
    customerId: string,
    addItemDto: AddItemCartDto,
  ): Promise<CartResponseDto> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('ID khách hàng không hợp lệ');
    }

    if (!Types.ObjectId.isValid(addItemDto.productId)) {
      throw new BadRequestException('ID sản phẩm không hợp lệ');
    }

    // Kiểm tra sản phẩm có tồn tại không
    const product = await this.productModel.findById(addItemDto.productId);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    // Kiểm tra tồn kho
    if (product.stockQuantity < addItemDto.quantity) {
      throw new BadRequestException('Số lượng sản phẩm không đủ trong kho');
    }

    // Tìm hoặc tạo giỏ hàng
    let cart = await this.cartModel.findOne({ customerId: customerId });
    if (!cart) {
      // Tạo giỏ hàng mới nếu chưa có
      cart = new this.cartModel({
        customerId: customerId, // Sử dụng string để nhất quán
        items: [],
        totalAmount: 0,
        totalItems: 0,
      });

      console.log(`🛒 Tạo giỏ hàng mới cho khách hàng: ${customerId}`);
    }

    // Kiểm tra sản phẩm đã có trong giỏ chưa
    const existingItemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === addItemDto.productId,
    );

    if (existingItemIndex > -1) {
      // Cập nhật số lượng
      const newQuantity =
        cart.items[existingItemIndex].quantity + addItemDto.quantity;

      if (product.stockQuantity < newQuantity) {
        throw new BadRequestException('Số lượng sản phẩm không đủ trong kho');
      }

      cart.items[existingItemIndex].quantity = newQuantity;
    } else {
      // Thêm sản phẩm mới
      cart.items.push({
        productId: new Types.ObjectId(addItemDto.productId),
        quantity: addItemDto.quantity,
        price: product.price,
        discountedPrice: product.discountedPrice,
        addedAt: new Date(),
      });
    }

    const savedCart = await cart.save();
    return this.findByCustomerId(customerId);
  }

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   */
  async updateItem(
    customerId: string,
    productId: string,
    updateItemDto: UpdateItemCartDto,
  ): Promise<CartResponseDto> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('ID khách hàng không hợp lệ');
    }

    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('ID sản phẩm không hợp lệ');
    }

    const cart = await this.cartModel.findOne({ customerId: customerId });
    if (!cart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng');
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    // Kiểm tra tồn kho
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    if (product.stockQuantity < updateItemDto.quantity) {
      throw new BadRequestException('Số lượng sản phẩm không đủ trong kho');
    }

    cart.items[itemIndex].quantity = updateItemDto.quantity;
    await cart.save();

    return this.findByCustomerId(customerId);
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  async removeItem(
    customerId: string,
    productId: string,
  ): Promise<CartResponseDto> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('ID khách hàng không hợp lệ');
    }

    if (!Types.ObjectId.isValid(productId)) {
      throw new BadRequestException('ID sản phẩm không hợp lệ');
    }

    const cart = await this.cartModel.findOne({ customerId: customerId });
    if (!cart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng');
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId,
    );

    if (itemIndex === -1) {
      throw new NotFoundException('Không tìm thấy sản phẩm trong giỏ hàng');
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    return this.findByCustomerId(customerId);
  }

  /**
   * Xóa toàn bộ giỏ hàng
   */
  async clearCart(customerId: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(customerId)) {
      throw new BadRequestException('ID khách hàng không hợp lệ');
    }

    const cart = await this.cartModel.findOne({ customerId: customerId });
    if (!cart) {
      throw new NotFoundException('Không tìm thấy giỏ hàng');
    }

    cart.items = [];
    await cart.save();

    return { message: 'Đã xóa toàn bộ sản phẩm trong giỏ hàng' };
  }

  /**
   * Xóa giỏ hàng (dành cho admin)
   */
  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID giỏ hàng không hợp lệ');
    }

    const result = await this.cartModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Không tìm thấy giỏ hàng');
    }
  }

  /**
   * Lấy tất cả giỏ hàng (dành cho admin)
   */
  async findAll(): Promise<CartResponseDto[]> {
    const carts = await this.cartModel
      .find()
      .populate('items.productId')
      .sort({ updatedAt: -1 })
      .exec();

    return carts.map((cart) => this.mapToResponseDto(cart));
  }

  /**
   * Map Cart document to CartResponseDto
   */
  private mapToResponseDto(cart: CartDocument): CartResponseDto {
    const items: CartItemDto[] = cart.items.map((item) => {
      const product = item.productId as any;
      const effectivePrice = item.discountedPrice || item.price;

      return {
        product: {
          id: product._id?.toString() || product.toString(),
          productName: product.productName || 'Tên sản phẩm không có',
          price: product.price || item.price,
          discountedPrice: product.discountedPrice || item.discountedPrice,
          images: product.images || [],
          material: product.material || '',
          stockQuantity: product.stockQuantity || 0,
        },
        quantity: item.quantity,
        price: item.price,
        discountedPrice: item.discountedPrice,
        effectivePrice,
        subtotal: effectivePrice * item.quantity,
        addedAt: item.addedAt,
      };
    });

    return {
      id: cart._id.toString(),
      customerId: cart.customerId.toString(),
      items,
      totalItems: cart.totalItems,
      totalAmount: cart.totalAmount,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }
}
