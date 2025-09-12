const Checkout = require('../models/checkoutModel');

exports.saveCheckoutSession = async (req, res) => {
  try {
    const sessionData = req.body;
    const saved = await Checkout.saveCheckoutSession(req.user.id, sessionData);
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};