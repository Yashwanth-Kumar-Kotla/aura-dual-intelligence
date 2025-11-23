/**
 * OTP Storage Utility
 * 
 * Manages OTP (One-Time Password) generation, storage, and verification.
 * OTPs are stored in JSON files with expiration times.
 * 
 * Structure:
 * - OTPs file: data/otps.json
 * - Each OTP: { email, code, expiresAt, attempts, createdAt, purpose }
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const OTPS_FILE = path.join(process.cwd(), 'data', 'otps.json');
const OTP_EXPIRY_MINUTES = 10; // OTP expires in 10 minutes
const RESEND_WAIT_MINUTES = 1; // Wait 1 minute before allowing resend
const MAX_ATTEMPTS = 5; // Max verification attempts per OTP
const MAX_OTP_REQUESTS_PER_HOUR = 5; // Rate limiting

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Load all OTPs from file
const loadOTPs = () => {
  ensureDataDir();
  if (!fs.existsSync(OTPS_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(OTPS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading OTPs:', error);
    return [];
  }
};

// Save OTPs to file
const saveOTPs = (otps) => {
  ensureDataDir();
  // Clean up expired OTPs before saving
  const now = new Date();
  const activeOTPs = otps.filter(otp => new Date(otp.expiresAt) > now);
  fs.writeFileSync(OTPS_FILE, JSON.stringify(activeOTPs, null, 2));
};

// Generate a random 6-digit OTP
export const generateOTP = () => {
  // Generate cryptographically secure random number
  const randomBytes = crypto.randomBytes(3);
  const otp = (parseInt(randomBytes.toString('hex'), 16) % 1000000)
    .toString()
    .padStart(6, '0');
  return otp;
};

// Create and store a new OTP
export const createOTP = (email, purpose = 'login') => {
  const otps = loadOTPs();
  
  // Check rate limiting - count OTPs created in last hour for this email
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentOTPs = otps.filter(
    otp => otp.email === email && new Date(otp.createdAt) > oneHourAgo
  );
  
  if (recentOTPs.length >= MAX_OTP_REQUESTS_PER_HOUR) {
    throw new Error('Too many OTP requests. Please try again later.');
  }
  
  // Check if we can resend (wait 1 minute between resends)
  const oneMinuteAgo = new Date(Date.now() - RESEND_WAIT_MINUTES * 60 * 1000);
  const recentOTP = otps.find(
    otp => otp.email === email && new Date(otp.createdAt) > oneMinuteAgo
  );
  
  if (recentOTP) {
    const secondsLeft = Math.ceil((new Date(recentOTP.createdAt).getTime() + RESEND_WAIT_MINUTES * 60 * 1000 - Date.now()) / 1000);
    throw new Error(`Please wait ${Math.ceil(secondsLeft / 60)} minute(s) before requesting a new code.`);
  }
  
  // Remove any existing OTPs for this email (only one active OTP per email)
  const filteredOTPs = otps.filter(otp => otp.email !== email);
  
  // Generate new OTP
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  
  const newOTP = {
    email,
    code,
    expiresAt: expiresAt.toISOString(),
    attempts: 0,
    createdAt: new Date().toISOString(),
    purpose, // 'login' or 'signup'
  };
  
  filteredOTPs.push(newOTP);
  saveOTPs(filteredOTPs);
  
  return code;
};

// Verify an OTP
export const verifyOTP = (email, code) => {
  const otps = loadOTPs();
  const otp = otps.find(o => o.email === email);
  
  if (!otp) {
    return { valid: false, error: 'OTP not found. Please request a new one.' };
  }
  
  // Check if expired
  if (new Date(otp.expiresAt) < new Date()) {
    // Remove expired OTP
    const filteredOTPs = otps.filter(o => o.email !== email);
    saveOTPs(filteredOTPs);
    return { valid: false, error: 'OTP has expired. Please request a new one.' };
  }
  
  // Check attempts
  if (otp.attempts >= MAX_ATTEMPTS) {
    // Remove OTP after max attempts
    const filteredOTPs = otps.filter(o => o.email !== email);
    saveOTPs(filteredOTPs);
    return { valid: false, error: 'Too many failed attempts. Please request a new OTP.' };
  }
  
  // Verify code
  if (otp.code !== code) {
    // Increment attempts
    otp.attempts += 1;
    saveOTPs(otps);
    return { valid: false, error: 'Invalid OTP code. Please try again.' };
  }
  
  // Valid OTP - remove it (one-time use)
  const filteredOTPs = otps.filter(o => o.email !== email);
  saveOTPs(filteredOTPs);
  
  return { valid: true, purpose: otp.purpose };
};

// Get OTP info (for checking if one exists)
export const getOTPInfo = (email) => {
  const otps = loadOTPs();
  const otp = otps.find(o => o.email === email);
  
  if (!otp) {
    return null;
  }
  
  if (new Date(otp.expiresAt) < new Date()) {
    return null; // Expired
  }
  
  return {
    email: otp.email,
    expiresAt: otp.expiresAt,
    attempts: otp.attempts,
    purpose: otp.purpose,
  };
};

// Clean up expired OTPs (can be called periodically)
export const cleanupExpiredOTPs = () => {
  const otps = loadOTPs();
  const now = new Date();
  const activeOTPs = otps.filter(otp => new Date(otp.expiresAt) > now);
  saveOTPs(activeOTPs);
  return otps.length - activeOTPs.length; // Return count of cleaned up OTPs
};

