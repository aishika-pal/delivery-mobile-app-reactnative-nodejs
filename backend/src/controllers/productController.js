const Product = require('../models/productModel');
const Store = require('../models/storeModel');

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(404).json({ error: 'Product not found' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied' });
    }

    const { category, storeId, isOTC, ...rest } = req.body;
    if (!category || !storeId) {
      return res.status(400).json({ error: 'category and storeId are required' });
    }

    const store = await Store.getStoreById(storeId);
    if (!store) {
      return res.status(400).json({ error: 'Invalid storeId' });
    }
    const storeType = store.type;

    // Medicines: only from pharmacy, require isOTC (OTC or non-OTC)
    if (category === 'medicines') {
      if (storeType !== 'pharmacy') {
        return res.status(400).json({ error: 'Medicines can only be added to pharmacy stores' });
      }
      if (typeof isOTC !== 'boolean') {
        return res.status(400).json({ error: 'isOTC field is required for medicines from pharmacy stores' });
      }
      // If non-OTC, you may add extra logic here if needed (e.g., require prescription on order)
    }
    // Food: only from eatery
    if (category === 'food' && storeType !== 'eatery') {
      return res.status(400).json({ error: 'Food can only be added to eatery stores' });
    }
    // Groceries: only from grocery
    if (category === 'groceries' && storeType !== 'grocery') {
      return res.status(400).json({ error: 'Groceries can only be added to grocery stores' });
    }
    // Healthcare & Wellness: only from pharmacy or grocery
    if (
      category === 'healthcare-wellness' &&
      !['pharmacy', 'grocery'].includes(storeType)
    ) {
      return res.status(400).json({ error: 'Healthcare & Wellness products can only be added to pharmacy or grocery stores' });
    }

    const product = await Product.createProduct({
      ...rest,
      category,
      storeId,
      storeType,
      ...(category === 'medicines' ? { isOTC } : {})
    });

    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.getProductById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Permission denied' });
    }
    await Product.deleteProduct(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};