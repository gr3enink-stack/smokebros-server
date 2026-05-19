import { Response } from 'express';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';

// @desc    Get all products with filters
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { brand, strength, size, minPrice, maxPrice, search, sort, page = 1, limit = 20 } = req.query;

    const query: any = { isActive: true };

    // Filter by brand
    if (brand) {
      query.brand = brand;
    }

    // Filter by strength
    if (strength) {
      query.strength = strength;
    }

    // Filter by size
    if (size) {
      query.size = size;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Search by name or description
    if (search) {
      query.$text = { $search: search as string };
    }

    // Sort
    let sortOption: any = { createdAt: -1 };
    if (sort === 'price-asc') sortOption = { price: 1 };
    if (sort === 'price-desc') sortOption = { price: -1 };
    if (sort === 'name') sortOption = { name: 1 };

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: products,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
export const getProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findOne({ slug: req.params.slug });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all brands
// @route   GET /api/products/brands
// @access  Public
export const getBrands = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const brands = await Product.distinct('brand');

    res.status(200).json({
      success: true,
      data: brands,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
