import Order from '../models/Order.js';

export const createOrder = async (req, res) => {
  const { items, totalAmount, shippingAddress, paymentMethod } = req.body;

  try {
    const newOrder = new Order({
      customer: req.userId,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod,
      createdAt: new Date().toISOString()
    });

    await newOrder.save();

    const populatedOrder = await Order.findById(newOrder._id)
      .populate('customer', 'name email')
      .populate('items.product', 'name');

    // Emit real-time WebSockets events
    if (req.io) {
      req.io.emit('order_placed', populatedOrder);
      req.io.emit('admin_stats_updated');
    }

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const fetchAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('customer', 'name email')
      .populate('items.product', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
