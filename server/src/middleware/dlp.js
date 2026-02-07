// dlp.js
// Data Loss Prevention middleware for sensitive data detection
import fs from 'fs';

// Example regex patterns for PII/PHI/credit cards/SSN
const patterns = [
  { name: 'Credit Card', regex: /\b(?:\d[ -]*?){13,16}\b/ },
  { name: 'SSN', regex: /\b\d{3}-\d{2}-\d{4}\b/ },
  { name: 'Email', regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/ },
  { name: 'Phone', regex: /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/ },
  { name: 'Medical Record', regex: /MRN[:\s]?\d{6,}/i },
  // Add more as needed
];

const dlpMiddleware = async function dlpMiddleware(req, res, next) {
  if (!req.file) return next();
  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    const fileText = fileBuffer.toString('utf8');
    for (const pattern of patterns) {
      if (pattern.regex.test(fileText)) {
        // Optionally: log, flag, or block
        return res.status(400).json({
          message: `Upload blocked by DLP: Detected ${pattern.name}`
        });
      }
    }
    next();
  } catch (err) {
    next(err);
  }
};
export default dlpMiddleware; 