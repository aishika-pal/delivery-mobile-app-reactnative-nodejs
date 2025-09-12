const Cart = require('../models/cartModel');

exports.addProduct = async (req, res) => {
  try {
    const product = req.body;
    const cart = await Cart.addProduct(req.user.id, product);
    if (cart.error) {
      return res.status(400).json({ error: cart.error });
    }
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.changeQuantity = async (req, res) => {
  try {
    const { productId, delta } = req.body;
    if (!productId || typeof delta !== 'number') {
      return res.status(400).json({ error: 'productId and delta are required' });
    }
    const cart = await Cart.changeQuantity(req.user.id, productId, delta);
    if (cart.error) {
      return res.status(400).json({ error: cart.error });
    }
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.removeProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ error: 'productId is required' });
    }
    const cart = await Cart.removeProduct(req.user.id, productId);
    if (cart.error) {
      return res.status(400).json({ error: cart.error });
    }
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.addPrescription = async (req, res) => {
  try {
    const { productId, prescriptionUrl } = req.body;
    if (!productId || !prescriptionUrl) {
      return res.status(400).json({ error: 'productId and prescriptionUrl required' });
    }
    const cart = await Cart.addPrescription(req.user.id, productId, prescriptionUrl);
    res.json(cart);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Only require prescription for non-OTC medicines from pharmacy stores
exports.validateCartForCheckout = async (req, res) => {
  try {
    const result = await Cart.validateCartForCheckout(req.user.id);
    if (!result.valid) {
      return res.status(400).json({ error: result.error, productId: result.productId });
    }
    res.json({ valid: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};