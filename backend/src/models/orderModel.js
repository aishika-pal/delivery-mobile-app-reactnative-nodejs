const admin = require('firebase-admin');
const db = admin.firestore();
const ordersCollection = db.collection('orders');

exports.createOrder = async (orderData) => {
  // Address must be present
  if (
    !orderData.address ||
    !orderData.address.name ||
    !orderData.address.buildingName ||
    !orderData.address.streetName ||
    !orderData.address.city ||
    !orderData.address.state ||
    !orderData.address.country ||
    !orderData.address.pin
  ) {
    throw new Error('Complete address is required to place an order');
  }

  // Payment check: Only allow order placement if payment is done or method is COD
  if (
    !orderData.payment ||
    !orderData.payment.method ||
    (
      orderData.payment.method !== 'cod' &&
      orderData.payment.status !== 'success'
    )
  ) {
    throw new Error('Payment must be completed before placing the order (except Cash on Delivery)');
  }

  for (const item of orderData.items || []) {
    if (
      item.category === 'medicines' &&
      item.storeType === 'pharmacy' &&
      item.isOTC === false
    ) {
      if (
        !orderData.prescriptions ||
        !orderData.prescriptions[item.productId]
      ) {
        throw new Error(`Prescription required for non-OTC medicine: ${item.name}`);
      }
      item.prescriptionUrl = orderData.prescriptions[item.productId];
    }
  }
  const ref = await ordersCollection.add(orderData);
  return { id: ref.id, ...orderData };
};

exports.getOrderById = async (orderId) => {
  const doc = await ordersCollection.doc(orderId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

exports.updateOrderStatus = async (orderId, status) => {
  await ordersCollection.doc(orderId).update({ status });
  return true;
};

// Cancel order (delete or mark as cancelled)
exports.cancelOrder = async (orderId, userId, userRole) => {
  const doc = await ordersCollection.doc(orderId).get();
  if (!doc.exists) throw new Error('Order not found');
  const order = doc.data();

  // Only the customer who placed the order can cancel it
  if (userRole !== 'customer' || order.userId !== userId) {
    throw new Error('Permission denied');
  }
  await ordersCollection.doc(orderId).update({ status: 'cancelled', cancelledAt: new Date().toISOString() });
  return true;
};

// For admin/shop owner: delete order (e.g., after processing/cancellation)
exports.deleteOrder = async (orderId, userRole) => {
  if (!['admin', 'shop_owner'].includes(userRole)) {
    throw new Error('Permission denied');
  }
  await ordersCollection.doc(orderId).delete();
  return true;
};