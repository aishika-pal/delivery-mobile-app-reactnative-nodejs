const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');

// Initialize Firebase Admin SDK (make sure serviceAccountKey.json is set up if needed)
if (!admin.apps.length) {
  admin.initializeApp({
    // credential: admin.credential.cert(require('./config/serviceAccountKey.json')),
    // databaseURL: 'https://<your-project-id>.firebaseio.com'
  });
}

const userRoutes = require('./routes/userRoutes');
const storeRoutes = require('./routes/storeRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Dummy authentication middleware for demonstration
// Replace with your real authentication logic (e.g., Firebase Auth JWT verification)
const authMiddleware = (req, res, next) => {
  // Example: set req.user from a decoded token
  // In production, verify token and set req.user accordingly
  req.user = {
    id: req.headers['x-user-id'] || 'testuserid',
    role: req.headers['x-user-role'] || 'customer', // or 'admin'
  };
  next();
};

const app = express();
app.use(bodyParser.json());
app.use(authMiddleware);

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/product', productRoutes);
app.use('/api/order', orderRoutes);

// Error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;