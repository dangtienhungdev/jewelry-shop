import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import {
  CategoryResponseDto,
  CategoryTreeDto,
} from './dto/category-response.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category, CategoryDocument } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    // Kiểm tra tên danh mục đã tồn tại
    const existingCategory = await this.categoryModel.findOne({
      categoryName: createCategoryDto.categoryName,
      parentId: createCategoryDto.parentId || null,
    });

    if (existingCategory) {
      throw new ConflictException(
        'Tên danh mục đã tồn tại trong danh mục cha này',
      );
    }

    // Kiểm tra parent category tồn tại (nếu có)
    if (createCategoryDto.parentId) {
      const parentCategory = await this.categoryModel.findById(
        createCategoryDto.parentId,
      );
      if (!parentCategory) {
        throw new NotFoundException('Không tìm thấy danh mục cha');
      }
      if (!parentCategory.isActive) {
        throw new BadRequestException('Danh mục cha không hoạt động');
      }
    }

    const category = new this.categoryModel({
      ...createCategoryDto,
      parentId: createCategoryDto.parentId
        ? new Types.ObjectId(createCategoryDto.parentId)
        : null,
    });

    const savedCategory = await category.save();
    return this.mapToResponseDto(savedCategory);
  }

  async findAll(
    options: {
      page?: number;
      limit?: number;
      isActive?: boolean;
      parentId?: string;
      search?: string;
    } = {},
  ): Promise<{
    items: CategoryResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    const { page = 1, limit = 10, isActive, parentId, search } = options;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (isActive !== undefined) {
      filter.isActive = isActive;
    }
    if (parentId !== undefined) {
      filter.parentId =
        parentId === 'null' ? null : new Types.ObjectId(parentId);
    }
    if (search) {
      filter.categoryName = { $regex: search, $options: 'i' };
    }

    const [categories, total] = await Promise.all([
      this.categoryModel
        .find(filter)
        .populate('parentId', 'categoryName')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.categoryModel.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      items: categories.map((category) => this.mapToResponseDto(category)),
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  async findOne(id: string): Promise<
    CategoryResponseDto & {
      subcategories: CategoryResponseDto[];
      parent?: CategoryResponseDto;
      productCount: number;
    }
  > {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID danh mục không hợp lệ');
    }

    const category = await this.categoryModel
      .findById(id)
      .populate('parentId', 'categoryName description')
      .exec();

    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    // Lấy danh mục con
    const subcategories = await this.categoryModel
      .find({ parentId: new Types.ObjectId(id) })
      .sort({ categoryName: 1 })
      .exec();

    // Đếm số lượng sản phẩm (sẽ cần import Product model)
    const productCount = this.getProductCountByCategory(id);

    return {
      ...this.mapToResponseDto(category),
      subcategories: subcategories.map((sub) => this.mapToResponseDto(sub)),
      parent: category.parentId
        ? this.mapToResponseDto(category.parentId as any)
        : undefined,
      productCount,
    };
  }

  async getTree(): Promise<CategoryTreeDto[]> {
    const categories = await this.categoryModel
      .find({ isActive: true })
      .sort({ categoryName: 1 })
      .exec();

    // Đếm số sản phẩm cho từng danh mục
    const categoriesWithProductCount = categories.map((category) => ({
      ...category.toObject(),
      productCount: this.getProductCountByCategory(category._id.toString()),
    }));

    return this.buildCategoryTree(categoriesWithProductCount);
  }

  async getRootCategories(): Promise<CategoryResponseDto[]> {
    const rootCategories = await this.categoryModel
      .find({ parentId: null, isActive: true })
      .sort({ categoryName: 1 })
      .exec();

    return rootCategories.map((category) => this.mapToResponseDto(category));
  }

  async getSubcategories(parentId: string): Promise<CategoryResponseDto[]> {
    if (!Types.ObjectId.isValid(parentId)) {
      throw new BadRequestException('ID danh mục cha không hợp lệ');
    }

    const subcategories = await this.categoryModel
      .find({ parentId: new Types.ObjectId(parentId), isActive: true })
      .sort({ categoryName: 1 })
      .exec();

    return subcategories.map((category) => this.mapToResponseDto(category));
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID danh mục không hợp lệ');
    }

    const existingCategory = await this.categoryModel.findById(id);
    if (!existingCategory) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    // Kiểm tra tên danh mục trùng
    if (updateCategoryDto.categoryName) {
      const duplicateCategory = await this.categoryModel.findOne({
        categoryName: updateCategoryDto.categoryName,
        parentId:
          updateCategoryDto.parentId !== undefined
            ? updateCategoryDto.parentId
              ? new Types.ObjectId(updateCategoryDto.parentId)
              : null
            : existingCategory.parentId,
        _id: { $ne: id },
      });

      if (duplicateCategory) {
        throw new ConflictException(
          'Tên danh mục đã tồn tại trong danh mục cha này',
        );
      }
    }

    // Kiểm tra parent category mới (nếu có)
    if (updateCategoryDto.parentId !== undefined) {
      if (updateCategoryDto.parentId) {
        // Kiểm tra không được set parent là chính nó
        if (updateCategoryDto.parentId === id) {
          throw new BadRequestException(
            'Không thể đặt danh mục làm cha của chính nó',
          );
        }

        // Kiểm tra không tạo vòng lặp
        if (await this.wouldCreateCycle(id, updateCategoryDto.parentId)) {
          throw new BadRequestException(
            'Không thể tạo vòng lặp trong cây danh mục',
          );
        }

        const parentCategory = await this.categoryModel.findById(
          updateCategoryDto.parentId,
        );
        if (!parentCategory) {
          throw new NotFoundException('Không tìm thấy danh mục cha');
        }
        if (!parentCategory.isActive) {
          throw new BadRequestException('Danh mục cha không hoạt động');
        }
      }
    }

    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, {
        new: true,
        runValidators: true,
      })
      .populate('parentId', 'categoryName description')
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException('Không tìm thấy danh mục sau khi cập nhật');
    }

    return this.mapToResponseDto(updatedCategory);
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID danh mục không hợp lệ');
    }

    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    // Kiểm tra danh mục có danh mục con không
    const subcategoriesCount = await this.categoryModel.countDocuments({
      parentId: new Types.ObjectId(id),
    });

    if (subcategoriesCount > 0) {
      throw new BadRequestException(
        'Không thể xóa danh mục có danh mục con. Vui lòng xóa danh mục con trước.',
      );
    }

    // Kiểm tra danh mục có sản phẩm không
    const productCount = this.getProductCountByCategory(id);
    if (productCount > 0) {
      throw new BadRequestException(
        'Không thể xóa danh mục có sản phẩm. Vui lòng chuyển sản phẩm sang danh mục khác trước.',
      );
    }

    await this.categoryModel.findByIdAndDelete(id);
  }

  async toggleActive(id: string): Promise<CategoryResponseDto> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('ID danh mục không hợp lệ');
    }

    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException('Không tìm thấy danh mục');
    }

    // Nếu vô hiệu hóa, cần vô hiệu hóa tất cả danh mục con
    if (category.isActive) {
      await this.deactivateSubcategories(id);
    }

    category.isActive = !category.isActive;
    const updatedCategory = await category.save();

    return this.mapToResponseDto(updatedCategory);
  }

  async getCategoryStats(): Promise<{
    totalCategories: number;
    activeCategories: number;
    rootCategories: number;
    categoriesWithProducts: number;
    topCategories: Array<{ categoryName: string; productCount: number }>;
  }> {
    const [totalCategories, activeCategories, rootCategories] =
      await Promise.all([
        this.categoryModel.countDocuments(),
        this.categoryModel.countDocuments({ isActive: true }),
        this.categoryModel.countDocuments({ parentId: null }),
      ]);

    // Lấy top categories (cần có Product model để thực hiện)
    const topCategories = await this.getTopCategoriesByProductCount();

    return {
      totalCategories,
      activeCategories,
      rootCategories,
      categoriesWithProducts: topCategories.filter(
        (cat) => cat.productCount > 0,
      ).length,
      topCategories: topCategories.slice(0, 5),
    };
  }

  async searchCategories(query: string): Promise<CategoryResponseDto[]> {
    const categories = await this.categoryModel
      .find({
        $or: [
          { categoryName: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
        isActive: true,
      })
      .populate('parentId', 'categoryName')
      .sort({ categoryName: 1 })
      .exec();

    return categories.map((category) => this.mapToResponseDto(category));
  }

  private async wouldCreateCycle(
    categoryId: string,
    newParentId: string,
  ): Promise<boolean> {
    let currentParentId: string | undefined = newParentId;

    while (currentParentId) {
      if (currentParentId === categoryId) {
        return true;
      }

      const parentCategory = await this.categoryModel.findById(currentParentId);
      currentParentId = parentCategory?.parentId?.toString();
    }

    return false;
  }

  private async deactivateSubcategories(parentId: string): Promise<void> {
    const subcategories = await this.categoryModel.find({
      parentId: new Types.ObjectId(parentId),
    });

    for (const subcategory of subcategories) {
      subcategory.isActive = false;
      await subcategory.save();

      // Đệ quy vô hiệu hóa danh mục con của danh mục con
      await this.deactivateSubcategories(subcategory._id.toString());
    }
  }

  private buildCategoryTree(
    categories: Array<any>,
    parentId: string | null = null,
  ): CategoryTreeDto[] {
    return categories
      .filter((cat) => {
        const catParentId = cat.parentId?.toString() || null;
        return catParentId === parentId;
      })
      .map((category) => ({
        id: category._id.toString(),
        categoryName: category.categoryName,
        description: category.description,
        parentId: category.parentId?.toString(),
        isActive: category.isActive,
        productCount: category.productCount || 0,
        children: this.buildCategoryTree(categories, category._id.toString()),
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      }));
  }

  private mapToResponseDto(category: CategoryDocument): CategoryResponseDto {
    return {
      id: category._id.toString(),
      categoryName: category.categoryName,
      description: category.description,
      parentId: category.parentId?.toString(),
      parent:
        category.parentId && (category.parentId as any).categoryName
          ? {
              id: (category.parentId as any)._id.toString(),
              categoryName: (category.parentId as any).categoryName,
              description: (category.parentId as any).description,
            }
          : undefined,
      isActive: category.isActive,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  private getProductCountByCategory(categoryId: string): number {
    // TODO: Implement when Product model is available
    // const productModel = this.connection.model('Product');
    // return productModel.countDocuments({ categoryId: new Types.ObjectId(categoryId) });
    return 0;
  }

  private async getTopCategoriesByProductCount(): Promise<
    Array<{ categoryName: string; productCount: number }>
  > {
    // TODO: Implement when Product model is available
    const categories = await this.categoryModel.find({ isActive: true });
    return categories.map((cat) => ({
      categoryName: cat.categoryName,
      productCount: 0, // Placeholder
    }));
  }
}
