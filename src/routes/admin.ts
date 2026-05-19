import { Router, Response } from 'express';
import { AuthRequest, protect } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';
import Product from '../models/Product';
import Order from '../models/Order';

const router = Router();

// Apply protect first, then admin auth to all routes
router.use(protect);
router.use(adminAuth);

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Total products
    const totalProducts = await Product.countDocuments();

    // Total orders
    const totalOrders = await Order.countDocuments();

    // Total revenue
    const revenueData = await Order.aggregate([
      { $match: { 'payment.status': 'success' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Low stock products (less than 10)
    const lowStock = await Product.countDocuments({ stock: { $lt: 10, $gt: 0 } });

    // Out of stock products
    const outOfStock = await Product.countDocuments({ stock: 0 });

    // Recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name phone')
      .select('-__v');

    res.status(200).json({
      success: true,
      data: {
        totalProducts,
        totalOrders,
        totalRevenue,
        lowStock,
        outOfStock,
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// @desc    Get all orders (admin view)
// @route   GET /api/admin/orders
// @access  Private/Admin
export const getAllOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('user', 'name phone email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: orders,
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// @desc    Update order status
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
      return;
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'name phone email');

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: order,
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

router.get('/stats', getStats);
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;
