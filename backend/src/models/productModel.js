const admin = require('firebase-admin');
const db = admin.firestore();
const productsCollection = db.collection('product');

exports.createProduct = async (productData) => {
  // Medicines: only from pharmacy, require isOTC (OTC or non-OTC)
  if (
    productData.category === 'medicines'
  ) {
    if (productData.storeType !== 'pharmacy') {
      throw new Error('Medicines can only be added to pharmacy stores');
    }
    if (typeof productData.isOTC !== 'boolean') {
      throw new Error('isOTC field is required for medicines from pharmacy stores');
    }
    // If non-OTC, optionally you can enforce other fields here if needed
  }
  // Food: only from eatery
  if (
    productData.category === 'food' &&
    productData.storeType !== 'eatery'
  ) {
    throw new Error('Food can only be added to eatery stores');
  }
  // Groceries: only from grocery
  if (
    productData.category === 'groceries' &&
    productData.storeType !== 'grocery'
  ) {
    throw new Error('Groceries can only be added to grocery stores');
  }
  // Healthcare & Wellness: only from pharmacy or grocery
  if (
    productData.category === 'healthcare-wellness' &&
    !['pharmacy', 'grocery'].includes(productData.storeType)
  ) {
    throw new Error('Healthcare & Wellness products can only be added to pharmacy or grocery stores');
  }
  const ref = await productsCollection.add(productData);
  return { id: ref.id, ...productData };
};

exports.getProductById = async (id) => {
  const doc = await productsCollection.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

exports.deleteProduct = async (id) => {
  await productsCollection.doc(id).delete();
  return true;
};