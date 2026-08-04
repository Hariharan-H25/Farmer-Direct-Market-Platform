import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from '../services/emailService.js';

export const createOrder = async (req, res) => {
  const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Order must contain at least one product item." });
  }

  try {
    const formattedItems = [];
    let calculatedTotal = 0;

    // Validate stock and attach farmer ID to each item
    for (const item of items) {
      if (!item.product || !mongoose.Types.ObjectId.isValid(item.product)) {
        return res.status(400).json({ message: "Invalid product item in order." });
      }

      const dbProduct = await Product.findById(item.product);
      if (!dbProduct) {
        return res.status(404).json({ message: `Product not found.` });
      }

      if (dbProduct.quantity < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for product '${dbProduct.name}'. Available: ${dbProduct.quantity}, Requested: ${item.quantity}` 
        });
      }

      // Deduct product quantity from DB
      dbProduct.quantity -= item.quantity;
      if (dbProduct.quantity === 0) {
        dbProduct.status = 'Out of Stock';
      }
      await dbProduct.save();

      const itemTotal = dbProduct.price * item.quantity;
      calculatedTotal += itemTotal;

      formattedItems.push({
        product: dbProduct._id,
        quantity: item.quantity,
        price: dbProduct.price,
        farmer: dbProduct.farmer
      });

      // Emit low stock alert if stock < 5
      if (dbProduct.quantity < 5 && req.io && dbProduct.farmer) {
        req.io.to(`farmer_${dbProduct.farmer.toString()}`).emit('low_stock_alert', {
          productId: dbProduct._id,
          name: dbProduct.name,
          quantity: dbProduct.quantity
        });
      }
    }

    const newOrder = new Order({
      customer: req.userId,
      items: formattedItems,
      totalAmount: totalAmount || calculatedTotal,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      deliveryStatus: 'Pending',
      statusHistory: [{ status: 'Pending', updatedAt: new Date() }],
      createdAt: new Date().toISOString()
    });

    await newOrder.save();

    const populatedOrder = await Order.findById(newOrder._id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name price image images')
      .populate('items.farmer', 'name farmName email phone');

    // Send Real-time WebSockets events
    if (req.io) {
      req.io.to(`user_${req.userId}`).emit('order_placed', populatedOrder);
      req.io.emit('order_placed', populatedOrder);
      req.io.emit('admin_stats_updated');
    }

    // Send email notification asynchronously
    if (populatedOrder.customer?.email) {
      sendOrderConfirmationEmail(populatedOrder, populatedOrder.customer.email).catch(console.error);
    }

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.userId })
      .populate('customer', 'name email phone')
      .populate('items.product', 'name price image images brand unit')
      .populate('items.farmer', 'name farmName location phone')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getFarmerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 'items.farmer': req.userId })
      .populate('customer', 'name email phone')
      .populate('items.product', 'name price image images')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const fetchAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email phone')
      .populate('items.product', 'name price image images')
      .populate('items.farmer', 'name farmName location')
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Invalid Order ID" });
  }

  try {
    const order = await Order.findById(id)
      .populate('customer', 'name email phone address')
      .populate('items.product', 'name price image images unit brand')
      .populate('items.farmer', 'name farmName location phone email');

    if (!order) return res.status(404).json({ message: "Order not found." });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { deliveryStatus, paymentStatus } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Invalid Order ID" });
  }

  const validStatuses = ['Pending', 'Confirmed', 'Processing', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];
  if (deliveryStatus && !validStatuses.includes(deliveryStatus)) {
    return res.status(400).json({ message: "Invalid delivery status value." });
  }

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (deliveryStatus) {
      order.deliveryStatus = deliveryStatus;
      order.statusHistory.push({ status: deliveryStatus, updatedAt: new Date() });
    }
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    await order.save();

    const updatedOrder = await Order.findById(id)
      .populate('customer', 'name email phone')
      .populate('items.product', 'name price image images');

    if (req.io) {
      req.io.to(`user_${order.customer.toString()}`).emit('order_status_updated', updatedOrder);
      req.io.emit('order_updated', updatedOrder);
      req.io.emit('admin_stats_updated');
    }

    if (updatedOrder.customer?.email && deliveryStatus) {
      sendOrderStatusUpdateEmail(updatedOrder, updatedOrder.customer.email, deliveryStatus).catch(console.error);
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Invalid Order ID" });
  }

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (order.customer.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ message: "Access denied. You can only cancel your own orders." });
    }

    const nonCancellable = ['Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned'];
    if (nonCancellable.includes(order.deliveryStatus)) {
      return res.status(400).json({ message: `Order cannot be cancelled at stage: ${order.deliveryStatus}` });
    }

    // Restore product quantities to stock
    for (const item of order.items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { quantity: item.quantity },
          $set: { status: 'Available' }
        });
      }
    }

    order.deliveryStatus = 'Cancelled';
    order.statusHistory.push({ status: 'Cancelled', updatedAt: new Date() });
    await order.save();

    const updatedOrder = await Order.findById(id).populate('customer', 'name email');

    if (req.io) {
      req.io.emit('order_cancelled', updatedOrder);
      req.io.emit('admin_stats_updated');
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const requestReturn = async (req, res) => {
  const { id } = req.params;
  const { returnReason } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: "Invalid Order ID" });
  }

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (order.customer.toString() !== req.userId) {
      return res.status(403).json({ message: "Access denied." });
    }

    if (order.deliveryStatus !== 'Delivered') {
      return res.status(400).json({ message: "Return requests can only be initiated for delivered orders." });
    }

    order.deliveryStatus = 'Returned';
    order.returnReason = returnReason || 'Return requested by buyer';
    order.statusHistory.push({ status: 'Returned', updatedAt: new Date() });

    await order.save();
    const updatedOrder = await Order.findById(id);

    if (req.io) {
      req.io.emit('order_returned', updatedOrder);
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
