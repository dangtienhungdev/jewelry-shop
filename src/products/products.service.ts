import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Category,
  CategoryDocument,
} from '../categories/schemas/category.schema';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  /**
   * Tạo sản phẩm mới
   */
  async create(
    createProductDto: CreateProductDto,
    createdBy?: string,
  ): Promise<ProductResponseDto> {
    // Kiểm tra category có tồn tại không
    const category = await this.categoryModel.findById(
      createProductDto.categoryId,
    );
    if (!category) {
      throw new NotFoundException('Danh mục không tồn tại');
    }

    if (!category.isActive) {
      throw new BadRequestException('Danh mục không hoạt động');
    }

    const productData = {
      ...createProductDto,
      createdBy: createdBy ? new Types.ObjectId(createdBy) : undefined,
      views: 0,
    };

    const createdProduct = new this.productModel(productData);
    const savedProduct = await createdProduct.save();

    return this.mapToResponseDto(savedProduct);
  }

  /**
   * Lấy tất cả sản phẩm với phân trang và lọc
   */
  async findAll(
    options: {
      page?: number;
      limit?: number;
      categoryId?: string;
      isFeatured?: boolean;
      material?: string;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
      sortBy?: 'price' | 'createdAt' | 'views' | 'productName';
      sortOrder?: 'asc' | 'desc';
    } = {},
  ): Promise<{
    items: ProductResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    const {
      page = 1,
      limit = 10,
      categoryId,
      isFeatured,
      material,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const filter: any = {};

    // Lọc theo danh mục
    if (categoryId) {
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new BadRequestException('ID danh mục không hợp lệ');
      }
      filter.categoryId = categoryId;
    }

    // Lọc theo sản phẩm nổi bật
    if (isFeatured !== undefined) {
      filter.isFeatured = isFeatured;
    }

    // Lọc theo chất liệu
    if (material) {
      filter.material = { $regex: material, $options: 'i' };
    }

    // Lọc theo giá
    if (minPrice !== undefined || maxPrice !== undefined) {
      if (minPrice !== undefined && maxPrice !== undefined) {
        filter.$or = [
          {
            $and: [
              { discountedPrice: { $ne: null } },
              { discountedPrice: { $gte: minPrice, $lte: maxPrice } },
            ],
          },
          {
            discountedPrice: null,
            price: { $gte: minPrice, $lte: maxPrice },
          },
        ];
      } else if (minPrice !== undefined) {
        filter.$or = [
          {
            $and: [
              { discountedPrice: { $ne: null } },
              { discountedPrice: { $gte: minPrice } },
            ],
          },
          { discountedPrice: null, price: { $gte: minPrice } },
        ];
      } else if (maxPrice !== undefined) {
        filter.$or = [
          {
            $and: [
              { discountedPrice: { $ne: null } },
              { discountedPrice: { $lte: maxPrice } },
            ],
          },
          { discountedPrice: null, price: { $lte: maxPrice } },
        ];
      }
    }

    // Tìm kiếm text - chỉ thêm khi search có giá trị hợp lệ
    if (search && search.trim().length > 0) {
      const searchTerm = search.trim();
      const searchFilter = {
        $or: [
          { productName: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { material: { $regex: searchTerm, $options: 'i' } },
        ],
      };

      // Nếu đã có $or filter từ price range, thì kết hợp với $and
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, searchFilter];
        delete filter.$or;
      } else {
        Object.assign(filter, searchFilter);
      }
    }

    // Sắp xếp
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('categoryId', 'categoryName description')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: products.map((product) => this.mapToResponseDto(product)),
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Lấy sản phẩm theo ID
   */
  async findOne(id: string): Promise<ProductResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID sản phẩm không hợp lệ');
    }

    const product = await this.productModel
      .findById(id)
      .populate('categoryId', 'categoryName description')
      .exec();

    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    // Tăng lượt xem
    await this.productModel.findByIdAndUpdate(id, { $inc: { views: 1 } });

    return this.mapToResponseDto(product);
  }

  /**
   * Cập nhật sản phẩm
   */
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID sản phẩm không hợp lệ');
    }

    // Nếu cập nhật categoryId, kiểm tra category có tồn tại không
    if (updateProductDto.categoryId) {
      const category = await this.categoryModel.findById(
        updateProductDto.categoryId,
      );
      if (!category) {
        throw new NotFoundException('Danh mục không tồn tại');
      }
      if (!category.isActive) {
        throw new BadRequestException('Danh mục không hoạt động');
      }
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, {
        new: true,
        runValidators: true,
      })
      .populate('categoryId', 'categoryName description')
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException('Không tìm thấy sản phẩm sau khi cập nhật');
    }

    return this.mapToResponseDto(updatedProduct);
  }

  /**
   * Xóa sản phẩm
   */
  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID sản phẩm không hợp lệ');
    }

    const result = await this.productModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }
  }

  /**
   * Lấy sản phẩm nổi bật
   */
  async getFeaturedProducts(limit: number = 10): Promise<ProductResponseDto[]> {
    const products = await this.productModel
      .find({ isFeatured: true, stockQuantity: { $gt: 0 } })
      .populate('categoryId', 'categoryName description')
      .sort({ views: -1 })
      .limit(limit)
      .exec();

    return products.map((product) => this.mapToResponseDto(product));
  }

  /**
   * Lấy sản phẩm mới nhất
   */
  async getLatestProducts(limit: number = 10): Promise<ProductResponseDto[]> {
    const products = await this.productModel
      .find({ stockQuantity: { $gt: 0 } })
      .populate('categoryId', 'categoryName description')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return products.map((product) => this.mapToResponseDto(product));
  }

  /**
   * Lấy sản phẩm theo danh mục
   */
  async getProductsByCategory(
    categoryId: string,
    limit: number = 10,
  ): Promise<ProductResponseDto[]> {
    if (!Types.ObjectId.isValid(categoryId)) {
      throw new BadRequestException('ID danh mục không hợp lệ');
    }

    const products = await this.productModel
      .find({
        categoryId: categoryId,
        stockQuantity: { $gt: 0 },
      })
      .populate('categoryId', 'categoryName description')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();

    return products.map((product) => this.mapToResponseDto(product));
  }

  /**
   * Tìm kiếm sản phẩm
   */
  async searchProducts(
    query: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: 'price' | 'createdAt' | 'views';
      sortOrder?: 'asc' | 'desc';
    } = {},
  ): Promise<{
    items: ProductResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    // Kiểm tra query có hợp lệ không
    if (!query || query.trim().length === 0) {
      throw new BadRequestException('Từ khóa tìm kiếm không được để trống');
    }

    const filter: any = {
      $or: [
        { productName: { $regex: query.trim(), $options: 'i' } },
        { description: { $regex: query.trim(), $options: 'i' } },
        { material: { $regex: query.trim(), $options: 'i' } },
      ],
      stockQuantity: { $gt: 0 },
    };

    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.productModel
        .find(filter)
        .populate('categoryId', 'categoryName description')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.productModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: products.map((product) => this.mapToResponseDto(product)),
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  /**
   * Cập nhật số lượng tồn kho
   */
  async updateStock(id: string, quantity: number): Promise<ProductResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID sản phẩm không hợp lệ');
    }

    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException('Không tìm thấy sản phẩm');
    }

    if (product.stockQuantity + quantity < 0) {
      throw new BadRequestException('Số lượng tồn kho không đủ');
    }

    const updatedProduct = await this.productModel
      .findByIdAndUpdate(
        id,
        { $inc: { stockQuantity: quantity } },
        { new: true, runValidators: true },
      )
      .populate('categoryId', 'categoryName description')
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException('Không tìm thấy sản phẩm sau khi cập nhật');
    }

    return this.mapToResponseDto(updatedProduct);
  }

  /**
   * Lấy thống kê sản phẩm
   */
  async getProductStats(): Promise<{
    totalProducts: number;
    totalInStock: number;
    totalOutOfStock: number;
    featuredProducts: number;
    averagePrice: number;
    topCategories: Array<{ categoryName: string; productCount: number }>;
  }> {
    const [
      totalProducts,
      totalInStock,
      totalOutOfStock,
      featuredProducts,
      avgPriceResult,
      topCategoriesResult,
    ] = await Promise.all([
      this.productModel.countDocuments(),
      this.productModel.countDocuments({ stockQuantity: { $gt: 0 } }),
      this.productModel.countDocuments({ stockQuantity: 0 }),
      this.productModel.countDocuments({ isFeatured: true }),
      this.productModel.aggregate([
        { $group: { _id: null, averagePrice: { $avg: '$price' } } },
      ]),
      this.productModel.aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'categoryId',
            foreignField: '_id',
            as: 'category',
          },
        },
        { $unwind: '$category' },
        {
          $group: {
            _id: '$categoryId',
            categoryName: { $first: '$category.categoryName' },
            productCount: { $sum: 1 },
          },
        },
        { $sort: { productCount: -1 } },
        { $limit: 5 },
      ]),
    ]);

    return {
      totalProducts,
      totalInStock,
      totalOutOfStock,
      featuredProducts,
      averagePrice: avgPriceResult[0]?.averagePrice || 0,
      topCategories: topCategoriesResult.map((cat) => ({
        categoryName: cat.categoryName,
        productCount: cat.productCount,
      })),
    };
  }

  /**
   * Map Product document to ProductResponseDto
   */
  private mapToResponseDto(product: ProductDocument): ProductResponseDto {
    const effectivePrice = product.discountedPrice || product.price;
    const discountPercentage = product.discountedPrice
      ? Math.round(
          ((product.price - product.discountedPrice) / product.price) * 100,
        )
      : 0;

    return {
      id: product._id.toString(),
      productName: product.productName,
      description: product.description,
      price: product.price,
      discountedPrice: product.discountedPrice,
      effectivePrice,
      discountPercentage,
      weight: product.weight,
      material: product.material,
      stockQuantity: product.stockQuantity,
      categoryId: product?.categoryId?.toString() || '',
      category: product.categoryId
        ? {
            id:
              (product.categoryId as any)._id?.toString() ||
              product.categoryId.toString(),
            categoryName: (product.categoryId as any).categoryName,
            description: (product.categoryId as any).description,
          }
        : undefined,
      createdBy: product.createdBy?.toString(),
      isFeatured: product.isFeatured,
      views: product.views,
      images: product.images || [],
      discounts:
        product.discounts?.map((discount) => ({
          discountId: discount.discountId.toString(),
          appliedAt: discount.appliedAt,
        })) || [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}
