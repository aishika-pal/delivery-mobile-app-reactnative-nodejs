const Payment = require('../models/paymentModel');

exports.createPayment = async (req, res) => {
  try {
    const paymentData = req.body;
    if (!paymentData.amount || !paymentData.method) {
      return res.status(400).json({ error: 'Payment amount and method are required' });
    }
    const payment = await Payment.createPayment(req.user.id, paymentData);
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.getPaymentById(req.params.id);
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};