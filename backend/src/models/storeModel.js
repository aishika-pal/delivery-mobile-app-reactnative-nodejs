const admin = require('firebase-admin');
const db = admin.firestore();
const storesCollection = db.collection('store');

exports.createStore = async (storeData) => {
  // Require 'type' field for store (must be one of: 'pharmacy', 'grocery', 'eatery')
  const allowedTypes = ['pharmacy', 'grocery', 'eatery'];
  if (!storeData.type || !allowedTypes.includes(storeData.type)) {
    throw new Error('Store type is required and must be one of: pharmacy, grocery, eatery');
  }
  const ref = await storesCollection.add(storeData);
  return { id: ref.id, ...storeData };
};

exports.getStoreById = async (id) => {
  const doc = await storesCollection.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

exports.deleteStore = async (id) => {
  await storesCollection.doc(id).delete();
  return true;
};