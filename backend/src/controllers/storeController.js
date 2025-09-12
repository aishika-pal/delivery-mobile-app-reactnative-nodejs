const Store = require('../models/storeModel');

exports.getStore = async (req, res) => {
  try {
    const store = await Store.getStoreById(req.params.id);
    if (!store) return res.status(404).json({ error: 'Store not found' });
    res.json(store);
  } catch (err) {
    res.status(404).json({ error: 'Store not found' });
  }
};

exports.createStore = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied' });
    }
    // Require 'type' field for store and validate allowed types
    const allowedTypes = ['pharmacy', 'grocery', 'eatery'];
    if (!req.body.type || !allowedTypes.includes(req.body.type)) {
      return res.status(400).json({ error: 'Store type is required and must be one of: pharmacy, grocery, eatery' });
    }
    const store = await Store.createStore(req.body);
    res.json(store);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.getStoreById(req.params.id);
    if (!store) return res.status(404).json({ error: 'Store not found' });
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied' });
    }
    await Store.deleteStore(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};