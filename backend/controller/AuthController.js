const User = require ('../Model/User');
const createError = require('http-errors');
const { signAccessToken, signRefreshToken } = require ('../MiddlewareS/JWT');

/**
 * User registration controller
 */
const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phoneNumber, password } = req.body;

    // Check if email already exists
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return next(createError(409, 'Email is already registered'));
    }

    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      role: 'user' // Default role
    });

    // Save user to database
    const savedUser = await user.save();

    // Generate tokens
    
    // Return success response
    res.status(201).json({
      success: true, 
      message: 'User registered successfully',
      user: savedUser.toJSON(),
    });
    
  } catch (error) {
    console.error('Registration Error:', error.message);
    if (error.name === 'ValidationError') {
      return next(createError(422, error.message));
    }
    next(createError(500, 'Internal Server Error'));
  }
};

/**
 * User login controller
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return next(createError(400, 'Email and password are required'));
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return next(createError(401, 'Invalid email or password'));
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return next(createError(401, 'Invalid email or password'));
    }

    // Generate tokens
    const accessToken = await signAccessToken(user.id, user.role);
    const refreshToken = await signRefreshToken(user.id,user.role);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
     userId:user.id,
      role: user.role,
      accessToken,
      refreshToken
    });
    
  } catch (error) {
    console.error('Login Error:', error.message);
    next(createError(500, 'Internal Server Error'));
  }
};

/**
 * Get current user profile
 */
const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return next(createError(404, 'User not found'));
    }
    
    res.status(200).json({
      success: true,
      user
    });
    
  } catch (error) {
    console.error('Get User Error:', error.message);
    next(createError(500, 'Internal Server Error'));
  }
};

/**
 * Refresh token controller
 */
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return next(createError(400, 'Refresh token is required'));
    }
    
    // Verify refresh token logic would go here
    // This would typically involve verifying the token using your JWT helper
    
    // For now, we'll just generate new tokens
    // In a real implementation, you'd verify the refresh token first
    
    // Mock implementation - you should replace this with proper verification
    const JWT = require('jsonwebtoken');
    const decoded = JWT.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
    
    const userId = decoded.userId;
    const role = decoded.role;
    
    const accessToken = await signAccessToken(userId, role);
    const newRefreshToken = await signRefreshToken(userId, role);
    
    res.status(200).json({
      success: true,
      accessToken,
      refreshToken: newRefreshToken
    });
    
  } catch (error) {
    console.error('Refresh Token Error:', error.message);
    next(createError(401, 'Invalid refresh token'));
  }
};

/**
 * Logout controller
 */
const logout = (req, res, next) => {
  // In a stateless JWT auth system, the client is responsible for removing the tokens
  // Server-side, we could implement a token blacklist if needed
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  register,
  login,
  getUserProfile,
  refreshToken,
  logout
};