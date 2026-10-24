import Order from '../models/Order.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';

// Haversine formula to compute great-circle distance between two GPS coordinates in km
const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const toRad = deg => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// 1. Get assigned and available orders for delivery dashboard
export const getDeliveryOrders = async (req, res) => {
  try {
    const assignedOrders = await Order.find({ 
      deliveryPerson: req.userId,
      deliveryStatus: { $ne: 'Cancelled' }
    })
      .sort({ createdAt: -1 })
      .populate('customer', 'name phone email')
      .populate('items.product', 'name price image unit')
      .populate('items.farmer', 'name farmName phone location address');

    // Also get orders ready for pickup without an assigned delivery driver
    const availablePickupOrders = await Order.find({
      deliveryPerson: null,
      deliveryStatus: { $in: ['Farmer Preparing', 'Pickup Pending', 'Confirmed'] }
    })
      .sort({ createdAt: -1 })
      .populate('customer', 'name phone email')
      .populate('items.product', 'name price image unit')
      .populate('items.farmer', 'name farmName phone location address');

    res.status(200).json({
      assigned: assignedOrders,
      available: availablePickupOrders
    });
  } catch (error) {
    logger.error('Failed to get delivery orders: ' + error.message);
    res.status(500).json({ message: "Failed to retrieve delivery orders." });
  }
};

// 2. Accept an available order for delivery
export const acceptDeliveryOrder = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    if (order.deliveryPerson && order.deliveryPerson.toString() !== req.userId) {
      return res.status(400).json({ message: "This order has already been assigned to another delivery partner." });
    }

    order.deliveryPerson = req.userId;
    if (order.deliveryStatus === 'Confirmed' || order.deliveryStatus === 'Pending') {
      order.deliveryStatus = 'Pickup Pending';
    }

    order.statusHistory.push({
      status: order.deliveryStatus,
      note: 'Delivery partner assigned and accepted pickup task.',
      updatedAt: new Date(),
      updatedBy: req.userId
    });

    await order.save();

    const populatedOrder = await Order.findById(id)
      .populate('customer', 'name phone email')
      .populate('deliveryPerson', 'name phone')
      .populate('items.farmer', 'name farmName phone location address');

    if (req.io) {
      req.io.to(`user_${order.customer}`).emit('order_status_updated', populatedOrder);
    }

    res.status(200).json({ message: "Order accepted successfully.", order: populatedOrder });
  } catch (error) {
    logger.error('Accept delivery order error: ' + error.message);
    res.status(500).json({ message: "Failed to accept order." });
  }
};

// 3. Update delivery order status (Pickup, Out for Delivery, Delivered)
export const updateDeliveryStatus = async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;

  const validTransitions = ['Pickup Pending', 'Picked Up', 'Out for Delivery', 'Delivered'];
  if (!validTransitions.includes(status)) {
    return res.status(400).json({ message: `Invalid status transition: ${status}. Permitted: ${validTransitions.join(', ')}` });
  }

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    // Validate authorization
    if (req.userRole !== 'admin' && (!order.deliveryPerson || order.deliveryPerson.toString() !== req.userId)) {
      return res.status(403).json({ message: "You are not authorized to update this delivery task." });
    }

    order.deliveryStatus = status;
    order.statusHistory.push({
      status,
      note: note || `Order status updated to ${status} by delivery partner.`,
      updatedAt: new Date(),
      updatedBy: req.userId
    });

    if (status === 'Delivered') {
      order.paymentStatus = 'Completed';
    }

    await order.save();

    const populatedOrder = await Order.findById(id)
      .populate('customer', 'name phone email')
      .populate('deliveryPerson', 'name phone')
      .populate('items.farmer', 'name farmName phone location address');

    if (req.io) {
      req.io.to(`user_${order.customer}`).emit('order_status_updated', populatedOrder);
    }

    res.status(200).json({ message: `Status updated to ${status}`, order: populatedOrder });
  } catch (error) {
    logger.error('Update delivery status error: ' + error.message);
    res.status(500).json({ message: "Failed to update delivery status." });
  }
};

// 4. Update live GPS location and compute ETA
export const updateLiveLocation = async (req, res) => {
  const { id } = req.params;
  const { lat, lng, speed, heading } = req.body;

  if (typeof lat !== 'number' || typeof lng !== 'number' || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return res.status(400).json({ message: "Valid numeric latitude (-90 to 90) and longitude (-180 to 180) are required." });
  }

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found." });

    // Authorization: only the assigned delivery driver or admin can broadcast location
    if (req.userRole !== 'admin' && (!order.deliveryPerson || order.deliveryPerson.toString() !== req.userId)) {
      return res.status(403).json({ message: "Access denied. Only the assigned delivery partner can update location." });
    }

    // Determine target coordinates for ETA calculation
    let destLat = null;
    let destLng = null;

    if (order.deliveryStatus === 'Pickup Pending' && order.pickupLocation && order.pickupLocation.lat) {
      destLat = order.pickupLocation.lat;
      destLng = order.pickupLocation.lng;
    } else if (order.shippingAddress?.location?.lat) {
      destLat = order.shippingAddress.location.lat;
      destLng = order.shippingAddress.location.lng;
    }

    let estimatedArrivalMinutes = order.estimatedArrivalMinutes;
    if (destLat && destLng) {
      const distanceKm = calculateDistanceKm(lat, lng, destLat, destLng);
      if (distanceKm !== null) {
        // Average speed: 25 km/h for local agricultural delivery routes
        const calculatedMinutes = Math.max(1, Math.round((distanceKm / 25) * 60));
        estimatedArrivalMinutes = calculatedMinutes;
      }
    }

    order.liveLocation = {
      lat,
      lng,
      speed: typeof speed === 'number' ? speed : 0,
      heading: typeof heading === 'number' ? heading : 0,
      updatedAt: new Date()
    };
    order.estimatedArrivalMinutes = estimatedArrivalMinutes;

    await order.save();

    const trackingPayload = {
      orderId: order._id,
      deliveryStatus: order.deliveryStatus,
      liveLocation: order.liveLocation,
      estimatedArrivalMinutes: order.estimatedArrivalMinutes,
      updatedAt: new Date().toISOString()
    };

    if (req.io) {
      req.io.to(`user_${order.customer}`).emit('delivery_location_update', trackingPayload);
    }

    res.status(200).json(trackingPayload);
  } catch (error) {
    logger.error('Update live location error: ' + error.message);
    res.status(500).json({ message: "Failed to record location update." });
  }
};

// 5. Get complete public/authenticated tracking data for map display
export const getOrderTracking = async (req, res) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id)
      .populate('customer', 'name phone')
      .populate('deliveryPerson', 'name phone')
      .populate('items.product', 'name price image unit')
      .populate('items.farmer', 'name farmName phone location address');

    if (!order) return res.status(404).json({ message: "Order not found." });

    // Ensure authorized access (customer, assigned delivery, farmer of item, or admin)
    const isCustomer = order.customer && order.customer._id.toString() === req.userId;
    const isDelivery = order.deliveryPerson && order.deliveryPerson._id.toString() === req.userId;
    const isFarmer = order.items.some(item => (item.farmer?._id || item.farmer)?.toString() === req.userId);
    const isAdmin = req.userRole === 'admin';

    if (!isCustomer && !isDelivery && !isFarmer && !isAdmin) {
      return res.status(403).json({ message: "Access denied. You do not have permission to track this order." });
    }

    res.status(200).json({
      orderId: order._id,
      deliveryStatus: order.deliveryStatus,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      shippingAddress: order.shippingAddress,
      pickupLocation: order.pickupLocation,
      deliveryPerson: order.deliveryPerson ? {
        name: order.deliveryPerson.name,
        phone: order.deliveryPerson.phone
      } : null,
      liveLocation: order.liveLocation,
      estimatedArrivalMinutes: order.estimatedArrivalMinutes,
      statusHistory: order.statusHistory,
      items: order.items,
      createdAt: order.createdAt
    });
  } catch (error) {
    logger.error('Get order tracking error: ' + error.message);
    res.status(500).json({ message: "Failed to fetch order tracking details." });
  }
};
