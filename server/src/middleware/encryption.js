// encryption.js
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

const ALGORITHM = 'aes-256-cbc';
const KEY = (process.env.ENCRYPTION_KEY || 'defaultverysecurekeydefaultverysecurek').trim().slice(0, 32); // 32 bytes
const IV_LENGTH = 16;

function encryptFile(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(KEY), iv);
    const input = fs.createReadStream(inputPath);
    const output = fs.createWriteStream(outputPath);
    output.write(iv); // prepend IV
    input.pipe(cipher).pipe(output);
    output.on('finish', resolve);
    output.on('error', reject);
  });
}

function decryptFile(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const input = fs.createReadStream(inputPath);
    let iv;
    let decipher;
    let started = false;
    input.on('readable', () => {
      if (!started) {
        iv = input.read(IV_LENGTH);
        if (!iv) return;
        decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(KEY), iv);
        started = true;
        input.pipe(decipher).pipe(fs.createWriteStream(outputPath));
      }
    });
    input.on('end', resolve);
    input.on('error', reject);
  });
}

export { encryptFile, decryptFile }; 