import jwt from 'jsonwebtoken';

export const generateToken = (userId, role = null) => {
  const payload = { userId };
  if (role) {
    payload.role = role;
  }
  
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
}; 