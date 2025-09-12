const Address = require('../models/addressModel');

exports.saveAddress = async (req, res) => {
  try {
    const address = req.body;
    if (!address || !address.name || !address.buildingName || !address.streetName || !address.city || !address.state || !address.country || !address.pin) {
      return res.status(400).json({ error: 'Complete address is required' });
    }
    const saved = await Address.saveAddress(req.user.id, address);
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAddress = async (req, res) => {
  try {
    const address = await Address.getAddress(req.user.id);
    if (!address) return res.status(404).json({ error: 'Address not found' });
    res.json(address);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};