import { User } from '../models/User.js';
import { asyncHandler } from '../middleware/errorHandler.js';

export const register = asyncHandler(async (req, res) => {
  const { uid, email, name, phone, photoURL, emailVerified } = req.user;

  let user = await User.findOne({ uid });

  if (user) {
    return res.status(200).json({
      success: true,
      message: 'User already exists',
      data: user
    });
  }

  user = await User.create({
    uid,
    email,
    name: name || email.split('@')[0],
    phone,
    photoURL,
    emailVerified: emailVerified || false
  });

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: user
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findOne({ uid: req.user.uid });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, photoURL } = req.body;
  
  const user = await User.findOneAndUpdate(
    { uid: req.user.uid },
    { 
      ...(name && { name }),
      ...(photoURL && { photoURL })
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findOneAndDelete({ uid: req.user.uid });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Account deleted successfully'
  });
});
