const Order = require('../models/orderModel');
const Cart = require('../models/cartModel');

exports.placeOrder = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Only customers can place orders' });
    }
    const cart = await Cart.getCartByUserId(req.user.id);
    const { items = [], prescriptions = {} } = cart;

    // Address fields from request body
    const { address, payment } = req.body;
    if (
      !address ||
      !address.name ||
      !address.buildingName ||
      !address.streetName ||
      !address.city ||
      !address.state ||
      !address.country ||
      !address.pin
    ) {
      return res.status(400).json({ error: 'Complete address is required to place an order' });
    }

    // Payment check: Only allow order placement if payment is done or method is COD
    if (
      !payment ||
      !payment.method ||
      (
        payment.method !== 'cod' &&
        payment.status !== 'success'
      )
    ) {
      return res.status(400).json({ error: 'Payment must be completed before placing the order (except Cash on Delivery)' });
    }

    for (const item of items) {
      if (
        item.category === 'medicines' &&
        item.storeType === 'pharmacy' &&
        item.isOTC === false &&
        !prescriptions[item.productId]
      ) {
        return res.status(400).json({ error: `Prescription required for non-OTC medicine: ${item.name}`, productId: item.productId });
      }
    }
    const orderData = {
      userId: req.user.id,
      items,
      prescriptions,
      address,
      payment,
      status: 'placed',
      createdAt: new Date().toISOString(),
    };
    const order = await Order.createOrder(orderData);
    await Cart.removeAll(req.user.id);
    res.json({ orderId: order.id, ...order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserOrder = async (req, res) => {
  try {
    const orders = await Order.getOrderByUserId(req.user.id);
    res.json(orders);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getOrder = async (req, res) => {
  try {
    const order = await Order.getOrderById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    // Only admin/shop_owner can update order status
    if (!['admin', 'shop_owner'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    const { orderId, status } = req.body;
    if (!orderId || !status) {
      return res.status(400).json({ error: 'orderId and status are required' });
    }
    await Order.updateOrderStatus(orderId, status);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Customer cancels their own order (marks as cancelled)
exports.cancelOrder = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ error: 'Only customers can cancel orders' });
    }
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }
    await Order.cancelOrder(orderId, req.user.id, req.user.role);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Admin/shop owner can delete order (e.g., after processing/cancellation)
exports.deleteOrder = async (req, res) => {
  try {
    if (!['admin', 'shop_owner'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }
    await Order.deleteOrder(orderId, req.user.role);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};