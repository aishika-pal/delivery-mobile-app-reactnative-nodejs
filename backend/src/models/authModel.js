const admin = require('firebase-admin');
const db = admin.firestore();
const usersCollection = db.collection('users');

exports.createUser = async (userData, uid) => {
  // userData should include: name, phone, countryCode, email, role, createdAt
  await usersCollection.doc(uid).set(userData);
  return { id: uid, ...userData };
};

exports.getUserByEmail = async (email) => {
  const snapshot = await usersCollection.where('email', '==', email).limit(1).get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};

exports.getUserByPhone = async (phone, countryCode) => {
  const snapshot = await usersCollection
    .where('phone', '==', phone)
    .where('countryCode', '==', countryCode)
    .limit(1)
    .get();
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
};