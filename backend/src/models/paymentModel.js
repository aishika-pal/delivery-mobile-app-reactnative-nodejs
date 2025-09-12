const admin = require('firebase-admin');
const db = admin.firestore();
const paymentsCollection = db.collection('payments');

exports.createPayment = async (userId, paymentData) => {
  const ref = await paymentsCollection.add({ userId, ...paymentData, createdAt: new Date().toISOString() });
  return { id: ref.id, userId, ...paymentData };
};

exports.getPaymentById = async (paymentId) => {
  const doc = await paymentsCollection.doc(paymentId).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};