import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import AuditLog from '../models/AuditLog.js';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import logger from '../utils/logger.js';

// Helper to record administrative audit events
export const logAdminAction = async (req, action, targetType, targetId, details = {}) => {
  try {
    const actorUser = req.userId ? await User.findById(req.userId).select('name role') : null;
    await AuditLog.create({
      actor: req.userId || null,
      actorName: actorUser?.name || 'Administrator',
      actorRole: actorUser?.role || req.userRole || 'admin',
      action,
      targetType,
      targetId: targetId ? targetId.toString() : null,
      details,
      ipAddress: req.ip || req.headers['x-forwarded-for'] || ''
    });
  } catch (err) {
    logger.warn('Failed to record audit log: ' + err.message);
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const { role, search, status } = req.query;
    const filter = {};

    if (role && role !== 'all') {
      filter.role = role === 'customer' ? { $in: ['buyer', 'customer'] } : role;
    }
    if (status && status !== 'all') {
      filter.accountStatus = status;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyFarmer = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found." });

    user.isVerified = !user.isVerified;
    const updatedUser = await user.save();
    
    await logAdminAction(req, user.isVerified ? 'VERIFY_FARMER' : 'UNVERIFY_FARMER', 'Farmer', id, {
      farmerName: user.name,
      verified: user.isVerified
    });

    if (req.io) {
      req.io.emit('farmer_verified', updatedUser);
      req.io.emit('admin_stats_updated');
    }
    
    const userObject = updatedUser.toObject();
    delete userObject.password;
    res.status(200).json(userObject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const toggleUserStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'Active' or 'Suspended'

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (user.role === 'admin' && user._id.toString() === req.userId) {
      return res.status(400).json({ message: "Administrators cannot suspend their own account." });
    }

    user.accountStatus = status === 'Suspended' ? 'Suspended' : 'Active';
    user.isAuthorized = user.accountStatus === 'Active';
    const updated = await user.save();

    await logAdminAction(req, user.accountStatus === 'Suspended' ? 'SUSPEND_USER' : 'ACTIVATE_USER', 'User', id, {
      userName: user.name,
      status: user.accountStatus
    });

    res.status(200).json({ message: `Account status updated to ${user.accountStatus}`, user: updated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delivery Personnel Management
export const getDeliveryPersonnel = async (req, res) => {
  try {
    const deliveryAgents = await User.find({ role: 'delivery' }).select('-password').sort({ createdAt: -1 });

    // Attach active delivery counts
    const agentsWithStats = await Promise.all(
      deliveryAgents.map(async (agent) => {
        const activeDeliveries = await Order.countDocuments({
          deliveryPerson: agent._id,
          deliveryStatus: { $in: ['Pickup Pending', 'Picked Up', 'Out for Delivery'] }
        });
        const completedDeliveries = await Order.countDocuments({
          deliveryPerson: agent._id,
          deliveryStatus: 'Delivered'
        });
        const agentObj = agent.toObject();
        agentObj.activeDeliveries = activeDeliveries;
        agentObj.completedDeliveries = completedDeliveries;
        return agentObj;
      })
    );

    res.status(200).json(agentsWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createDeliveryPersonnel = async (req, res) => {
  const { name, email, phone, password, city, state } = req.body;

  try {
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "Name, email, phone, and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(400).json({ message: "An account already exists with this email." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newDeliveryPerson = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password: hashedPassword,
      role: 'delivery',
      isVerified: true,
      isAuthorized: true,
      accountStatus: 'Active',
      location: { district: city || '', state: state || 'Tamil Nadu' }
    });

    await logAdminAction(req, 'CREATE_DELIVERY_PERSONNEL', 'Delivery', newDeliveryPerson._id, {
      name: newDeliveryPerson.name,
      email: newDeliveryPerson.email
    });

    const userObj = newDeliveryPerson.toObject();
    delete userObj.password;
    res.status(201).json({ message: "Delivery personnel created successfully.", user: userObj });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignDeliveryOrder = async (req, res) => {
  const { orderId, deliveryPersonId } = req.body;

  try {
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found." });

    const deliveryAgent = await User.findOne({ _id: deliveryPersonId, role: 'delivery' });
    if (!deliveryAgent) return res.status(404).json({ message: "Delivery partner not found." });

    order.deliveryPerson = deliveryAgent._id;
    if (order.deliveryStatus === 'Pending' || order.deliveryStatus === 'Confirmed') {
      order.deliveryStatus = 'Pickup Pending';
    }

    order.statusHistory.push({
      status: order.deliveryStatus,
      note: `Admin assigned order to delivery partner ${deliveryAgent.name}.`,
      updatedAt: new Date(),
      updatedBy: req.userId
    });

    await order.save();

    await logAdminAction(req, 'ASSIGN_DELIVERY', 'Order', orderId, {
      deliveryAgentName: deliveryAgent.name,
      deliveryAgentId: deliveryPersonId
    });

    const populated = await Order.findById(orderId)
      .populate('customer', 'name phone')
      .populate('deliveryPerson', 'name phone')
      .populate('items.product', 'name price image');

    if (req.io) {
      req.io.to(`delivery_${deliveryPersonId}`).emit('new_delivery_assigned', populated);
      req.io.to(`user_${order.customer}`).emit('order_status_updated', populated);
    }

    res.status(200).json({ message: "Delivery assigned successfully.", order: populated });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFarmers = await User.countDocuments({ role: 'farmer' });
    const totalBuyers = await User.countDocuments({ role: { $in: ['buyer', 'customer'] } });
    const totalDeliveryPersonnel = await User.countDocuments({ role: 'delivery' });
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
      totalDeliveryPersonnel,
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
    const farmerProducts = await Product.find({ farmer: req.userId });
    const productCount = farmerProducts.length;
    const lowStockProducts = farmerProducts.filter(p => p.quantity < 5);

    const farmerOrders = await Order.find({ 'items.farmer': req.userId })
      .populate('items.product', 'name price category');

    let totalRevenue = 0;
    let pendingOrdersCount = 0;
    const productSalesMap = {};

    farmerOrders.forEach(order => {
      if (order.deliveryStatus === 'Pending' || order.deliveryStatus === 'Confirmed' || order.deliveryStatus === 'Farmer Preparing' || order.deliveryStatus === 'Pickup Pending') {
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
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found." });

    await User.findByIdAndDelete(id);

    await logAdminAction(req, 'DELETE_USER', 'User', id, {
      deletedUserName: user.name,
      deletedUserEmail: user.email,
      role: user.role
    });
    
    if (req.io) {
      req.io.emit('user_deleted', { id });
      req.io.emit('admin_stats_updated');
    }
    
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
