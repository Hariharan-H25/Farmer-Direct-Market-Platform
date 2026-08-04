import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyFarmer = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedUser = await User.findByIdAndUpdate(id, { isVerified: true }, { new: true }).select('-password');
    
    if (req.io) {
      req.io.emit('farmer_verified', updatedUser);
      req.io.emit('admin_stats_updated');
    }
    
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalBuyers = await User.countDocuments({ role: { $in: ['buyer', 'customer'] } });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    // Revenue calculation from non-cancelled orders
    const revenueResult = await Order.aggregate([
      { $match: { deliveryStatus: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Monthly Sales Aggregation
    const monthlySales = await Order.aggregate([
      { $match: { deliveryStatus: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          totalSales: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      { $limit: 12 }
    ]);

    // Top Selling Products
    const topProducts = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$productDetails" }
    ]);

    res.status(200).json({
      totalUsers,
      totalFarmers,
      totalCustomers: totalBuyers,
      totalBuyers,
      totalProducts,
      totalOrders,
      totalRevenue,
      monthlySales: monthlySales.map(m => ({ month: m._id, sales: m.totalSales, count: m.orderCount })),
      topProducts: topProducts.map(p => ({
        id: p._id,
        name: p.productDetails.name,
        category: p.productDetails.category,
        totalQuantity: p.totalQuantity,
        totalRevenue: p.totalRevenue
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFarmerStats = async (req, res) => {
  try {
    const farmerId = new mongoose.Types.ObjectId(req.userId);

    // Products by this farmer
    const farmerProducts = await Product.find({ farmer: req.userId });
    const productCount = farmerProducts.length;

    const lowStockProducts = farmerProducts.filter(p => p.quantity < 5);

    // Orders containing items from this farmer
    const farmerOrders = await Order.find({ 'items.farmer': req.userId })
      .populate('items.product', 'name price category');

    let totalRevenue = 0;
    let pendingOrdersCount = 0;
    const productSalesMap = {};

    farmerOrders.forEach(order => {
      if (order.deliveryStatus === 'Pending' || order.deliveryStatus === 'Confirmed' || order.deliveryStatus === 'Processing') {
        pendingOrdersCount++;
      }

      if (order.deliveryStatus !== 'Cancelled') {
        order.items.forEach(item => {
          if (item.farmer && item.farmer.toString() === req.userId) {
            const itemRevenue = (item.price || 0) * (item.quantity || 0);
            totalRevenue += itemRevenue;

            const prodId = item.product?._id?.toString() || item.product?.toString();
            if (prodId) {
              if (!productSalesMap[prodId]) {
                productSalesMap[prodId] = {
                  name: item.product?.name || 'Product',
                  quantitySold: 0,
                  revenue: 0
                };
              }
              productSalesMap[prodId].quantitySold += item.quantity;
              productSalesMap[prodId].revenue += itemRevenue;
            }
          }
        });
      }
    });

    res.status(200).json({
      productCount,
      totalOrdersCount: farmerOrders.length,
      pendingOrdersCount,
      totalRevenue,
      lowStockCount: lowStockProducts.length,
      lowStockProducts: lowStockProducts.map(p => ({ id: p._id, name: p.name, quantity: p.quantity })),
      productPerformance: Object.values(productSalesMap)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await User.findByIdAndDelete(id);
    
    if (req.io) {
      req.io.emit('user_deleted', { id });
      req.io.emit('admin_stats_updated');
    }
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
