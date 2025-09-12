const admin = require('firebase-admin');
const db = admin.firestore();
const cartsCollection = db.collection('cart');

exports.getCartByUserId = async (userId) => {
  const doc = await cartsCollection.doc(userId).get();
  if (!doc.exists) return { items: [], prescriptions: {} };
  return { id: doc.id, ...doc.data() };
};

exports.addProduct = async (userId, product) => {
  const cartRef = cartsCollection.doc(userId);
  const cartDoc = await cartRef.get();
  let items = [];
  let prescriptions = {};
  if (cartDoc.exists) {
    items = cartDoc.data().items || [];
    prescriptions = cartDoc.data().prescriptions || {};
    const exists = items.find(i => i.productId === product.productId);
    if (exists) {
      // If already in cart, increase quantity by 1
      items = items.map(i =>
        i.productId === product.productId
          ? { ...i, quantity: (i.quantity || 1) + 1 }
          : i
      );
    } else {
      items.push({ ...product, quantity: product.quantity || 1 });
    }
  } else {
    items = [{ ...product, quantity: product.quantity || 1 }];
  }
  await cartRef.set({ items, prescriptions });
  return { id: userId, items, prescriptions };
};

exports.changeQuantity = async (userId, productId, delta) => {
  const cartRef = cartsCollection.doc(userId);
  const cartDoc = await cartRef.get();
  if (!cartDoc.exists) return { error: 'Cart not found' };
  let items = cartDoc.data().items || [];
  let prescriptions = cartDoc.data().prescriptions || {};
  items = items.map(i =>
    i.productId === productId
      ? { ...i, quantity: Math.max(1, (i.quantity || 1) + delta) }
      : i
  );
  await cartRef.set({ items, prescriptions });
  return { id: userId, items, prescriptions };
};

exports.removeProduct = async (userId, productId) => {
  const cartRef = cartsCollection.doc(userId);
  const cartDoc = await cartRef.get();
  if (!cartDoc.exists) return { error: 'Cart not found' };
  let items = cartDoc.data().items || [];
  let prescriptions = cartDoc.data().prescriptions || {};
  items = items.filter(i => i.productId !== productId);
  delete prescriptions[productId];
  await cartRef.set({ items, prescriptions });
  return { id: userId, items, prescriptions };
};

exports.addPrescription = async (userId, productId, prescriptionUrl) => {
  const cartRef = cartsCollection.doc(userId);
  const cartDoc = await cartRef.get();
  let prescriptions = cartDoc.exists ? (cartDoc.data().prescriptions || {}) : {};
  prescriptions[productId] = prescriptionUrl;
  await cartRef.set({ ...(cartDoc.data() || {}), prescriptions });
  return { id: userId, prescriptions };
};

// Only require prescription for non-OTC medicines from pharmacy stores
exports.validateCartForCheckout = async (userId) => {
  const cartDoc = await cartsCollection.doc(userId).get();
  if (!cartDoc.exists) return { valid: true };
  const { items = [], prescriptions = {} } = cartDoc.data();
  for (const item of items) {
    if (
      item.category === 'medicines' &&
      item.storeType === 'pharmacy' &&
      item.isOTC === false &&
      !prescriptions[item.productId]
    ) {
      return {
        valid: false,
        error: `Prescription required for non-OTC medicine: ${item.name}`,
        productId: item.productId
      };
    }
  }
  return { valid: true };
};