const User = require('../models/User');
const Organization = require('../models/Organization');
const { generateToken } = require('../config/jwt');
const { verifyGoogleToken } = require('../config/google-oauth');

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const user = await User.create({ username, email, password });

    // Create default organization
    const org = await Organization.create(`${username}'s Organization`, user.id);
    await Organization.addMember(org.id, user.id, 'admin', true);

    // Generate token
    const token = generateToken({ id: user.id, email: user.email });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        credits: user.credits
      },
      organization: org
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await User.verifyPassword(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get active organization
    const activeOrg = await Organization.getActiveOrganization(user.id);

    // Generate token
    const token = generateToken({ id: user.id, email: user.email });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        credits: user.credits
      },
      organization: activeOrg
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    // Verify Google token
    const payload = await verifyGoogleToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const { sub: googleId, email, name } = payload;

    // Check if user exists
    let user = await User.findByGoogleId(googleId);

    if (!user) {
      // Create new user
      user = await User.create({
        username: name,
        email,
        googleId
      });

      // Create default organization
      const org = await Organization.create(`${name}'s Organization`, user.id);
      await Organization.addMember(org.id, user.id, 'admin', true);
    }

    // Get active organization
    const activeOrg = await Organization.getActiveOrganization(user.id);

    // Generate JWT token
    const jwtToken = generateToken({ id: user.id, email: user.email });

    res.json({
      message: 'Google authentication successful',
      token: jwtToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        credits: user.credits
      },
      organization: activeOrg
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ error: 'Google authentication failed' });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const activeOrg = await Organization.getActiveOrganization(user.id);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        credits: user.credits
      },
      organization: activeOrg
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
};