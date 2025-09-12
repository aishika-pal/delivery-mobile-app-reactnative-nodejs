const admin = require('firebase-admin');
const db = admin.firestore();
const addressesCollection = db.collection('addresses');

exports.saveAddress = async (userId, address) => {
  await addressesCollection.doc(userId).set(address);
  return { userId, ...address };
};

exports.getAddress = async (userId) => {
  const doc = await addressesCollection.doc(userId).get();
  if (!doc.exists) return null;
  return { userId, ...doc.data() };
};