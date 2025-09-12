const admin = require('firebase-admin');
const db = admin.firestore();
const usersCollection = db.collection('users');

exports.createUser = async (userData) => {
  const ref = await usersCollection.add(userData);
  return { id: ref.id, ...userData };
};

exports.getUserById = async (id) => {
  const doc = await usersCollection.doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
};

exports.deleteUser = async (id) => {
  await usersCollection.doc(id).delete();
  return true;
};