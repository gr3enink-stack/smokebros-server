import { Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

// @desc    Create order
// @route   POST /api/orders
// @access  Public (guest or authenticated)
export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, shippingAddress, isAgeVerified, guestPhone, guestEmail } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ success: false, message: 'Order must contain items' });
      return;
    }

    if (!isAgeVerified) {
      res.status(400).json({ success: false, message: 'Age verification is required' });
      return;
    }

    // Validate stock and calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product).session(session);

      if (!product) {
        await session.abortTransaction();
        res.status(404).json({ success: false, message: `Product not found: ${item.product}` });
        return;
      }

      if (!product.isActive) {
        await session.abortTransaction();
        res.status(400).json({ success: false, message: `Product not available: ${product.name}` });
        return;
      }

      if (product.stock < item.quantity) {
        await session.abortTransaction();
        res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
        return;
      }

      const itemTotal = product.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
      });
    }

    // Create order
    const orderData: any = {
      items: orderItems,
      total,
      shippingAddress,
      isAgeVerified,
    };

    // Add user or guest info
    if (req.user) {
      orderData.user = req.user._id;
    } else {
      orderData.guestPhone = guestPhone;
      orderData.guestEmail = guestEmail;
    }

    const order = await Order.create([orderData], { session });

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      data: order[0],
    });
  } catch (error: any) {
    await session.abortTransaction();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
export const getUserOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name images');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product', 'name images');

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    // Check if user owns this order
    if (req.user && order.user && order.user.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to view this order' });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('user', 'name phone')
      .populate('items.product', 'name images');

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: orders,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order statistics (Admin)
// @route   GET /api/admin/orders/stats
// @access  Private/Admin
export const getOrderStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
        },
      },
    ]);

    const overallStats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$total' },
          avgOrderValue: { $avg: '$total' },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: stats,
        overall: overallStats[0] || { totalOrders: 0, totalRevenue: 0, avgOrderValue: 0 },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
