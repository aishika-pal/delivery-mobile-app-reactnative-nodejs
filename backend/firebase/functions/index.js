// Firebase Cloud Functions (Node.js)
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Example: Place Order
exports.placeOrder = functions.https.onCall(async (data, context) => {
  const { items } = data;
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  const userId = context.auth.uid;
  // Ensure items have quantity
  const itemsWithQty = (items || []).map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity || 1
  }));
  const order = {
    userId,
    items: itemsWithQty,
    status: 'placed',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };
  const ref = await admin.firestore().collection('orders').add(order);
  return { orderId: ref.id };
});

// Get user's orders
exports.getOrders = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  const userId = context.auth.uid;
  const snap = await admin.firestore().collection('orders').where('userId', '==', userId).orderBy('createdAt', 'desc').get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

// Cancel an order
exports.cancelOrder = functions.https.onCall(async (data, context) => {
  const { orderId } = data;
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  const userId = context.auth.uid;
  const orderRef = admin.firestore().collection('orders').doc(orderId);
  const orderDoc = await orderRef.get();
  if (!orderDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Order not found');
  }
  if (orderDoc.data().userId !== userId) {
    throw new functions.https.HttpsError('permission-denied', 'You can only cancel your own orders');
  }
  await orderRef.update({ status: 'cancelled' });
  return { success: true };
});

// Example: Get Nearby Stores
exports.getNearbyStores = functions.https.onCall(async (data, context) => {
  const { category, subCategory, storeType } = data;
  let query = admin.firestore().collection('stores');

  // Only filter by storeType if provided
  if (Array.isArray(storeType)) {
    query = query.where('type', 'in', storeType);
  } else if (storeType) {
    query = query.where('type', '==', storeType);
  } else if (category) {
    // fallback for food
    query = query.where('categories', 'array-contains', category);
  }

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});
