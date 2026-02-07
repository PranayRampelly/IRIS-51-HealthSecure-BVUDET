require('dotenv').config({ path: './.env' });
const jwt = require('jsonwebtoken');

console.log('JWT_SECRET:', process.env.JWT_SECRET); // Debug

if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is not set! Check your .env file in the server directory.');
  process.exit(1);
}

const token = jwt.sign(
  {
    userId: '6873c35f7854e712e381f1ea',
    role: 'patient'
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('Generated JWT:', token); 