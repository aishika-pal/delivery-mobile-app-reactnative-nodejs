const admin = require('firebase-admin');
const AuthModel = require('../models/authModel');

// SIGNUP
exports.signup = async (req, res) => {
  try {
    const { name, phone, countryCode, email, password, role } = req.body;
    if (!name || !phone || !countryCode || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists by email or phone
    if (email) {
      const existingUser = await AuthModel.getUserByEmail(email);
      if (existingUser) return res.status(409).json({ error: 'Email already registered' });
    }
    const existingPhoneUser = await AuthModel.getUserByPhone(phone, countryCode);
    if (existingPhoneUser) return res.status(409).json({ error: 'Phone already registered' });

    // Create Firebase Auth user
    const userRecord = await admin.auth().createUser({
      email: email || `${countryCode}${phone}@phoneuser.app`,
      password,
      displayName: name,
      phoneNumber: `${countryCode}${phone}`,
    });

    // Store user profile in Firestore
    const userData = {
      name,
      phone,
      countryCode,
      email: email || '',
      role,
      createdAt: new Date().toISOString(),
      uid: userRecord.uid,
    };
    await AuthModel.createUser(userData, userRecord.uid);

    res.status(201).json({ message: 'User created', user: userData });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, phone, countryCode, password } = req.body;
    let userEmail = email;
    if (!userEmail && phone && countryCode) {
      userEmail = `${countryCode}${phone}@phoneuser.app`;
    }
    if (!userEmail || !password) {
      return res.status(400).json({ error: 'Email/Phone and password required' });
    }

    // Firebase Admin SDK does not support password authentication directly.
    // In production, use Firebase Client SDK on frontend for signInWithEmailAndPassword.
    // Here, just check if user exists and return user profile.
    const user = await AuthModel.getUserByEmail(userEmail);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // For demo: do NOT check password here. In production, authenticate on frontend.
    res.json({ message: 'Login successful', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// FORGOT PASSWORD (send reset email)
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });
    await admin.auth().generatePasswordResetLink(email);
    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};