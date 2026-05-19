import { Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

// Generate JWT Token
const generateToken = (id: string, role: string): string => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRE || '7d') as any,
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { phone, email, password, name } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ phone });
    if (userExists) {
      res.status(400).json({ success: false, message: 'User already exists with this phone number' });
      return;
    }

    // Create user
    const user = await User.create({
      phone,
      email,
      password,
      name,
    });

    // Generate token
    const token = generateToken(user._id.toString(), user.role);

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { phone, password } = req.body;

    // Validate input
    if (!phone || !password) {
      res.status(400).json({ success: false, message: 'Please provide phone number and password' });
      return;
    }

    // Find user
    const user = await User.findOne({ phone }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString(), user.role);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        phone: user.phone,
        email: user.email,
        name: user.name,
        role: user.role,
        token,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
