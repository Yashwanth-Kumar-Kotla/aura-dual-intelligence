/**
 * User Storage Utility
 * 
 * This file handles user data storage. Currently using a JSON file,
 * but you can easily switch to a database (MongoDB, PostgreSQL, etc.) later.
 * 
 * Why JSON file? It's simple for development and doesn't require database setup.
 * For production, you'd want a real database for better performance and reliability.
 */

import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { encrypt, decrypt } from './encryption';

// Path to store user data
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
  }
};

// Read users from file
export const getUsers = () => {
  ensureDataDir();
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Save users to file
const saveUsers = (users) => {
  ensureDataDir();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// Find user by email
export const getUserByEmail = (email) => {
  const users = getUsers();
  return users.find(user => user.email === email);
};

// Find user by ID
export const getUserById = (id) => {
  const users = getUsers();
  return users.find(user => user.id === id);
};

// Create a new user
export const createUser = async (userData) => {
  const users = getUsers();
  const { email, password, name } = userData;
  
  // Check if user already exists
  if (getUserByEmail(email)) {
    throw new Error('User with this email already exists');
  }
  
  // Hash the password if provided (OTP users may not have passwords)
  // NEVER store plain text passwords!
  // bcrypt hashes passwords with a salt, making them secure
  const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
  
  // Create user object
  const newUser = {
    id: Date.now().toString(), // Simple ID generation (use UUID in production)
    email,
    name: name || email.split('@')[0], // Use email prefix as name if not provided
    password: hashedPassword, // Store hashed password (null for OTP users), never plain text!
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers(users);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
};

// Verify password
export const verifyPassword = async (plainPassword, hashedPassword) => {
  // bcrypt.compare checks if the plain password matches the hash
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Update user API keys
export const updateUserApiKeys = (email, openaiKey, geminiKey) => {
  const users = getUsers();
  const user = users.find(u => u.email === email);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Encrypt API keys before storing
  user.openaiApiKey = openaiKey ? encrypt(openaiKey) : null;
  user.geminiApiKey = geminiKey ? encrypt(geminiKey) : null;
  user.apiKeysUpdatedAt = new Date().toISOString();
  
  saveUsers(users);
  
  return {
    email: user.email,
    name: user.name,
    hasOpenaiKey: !!user.openaiApiKey,
    hasGeminiKey: !!user.geminiApiKey
  };
};

// Get user API keys (decrypted)
export const getUserApiKeys = (email) => {
  const user = getUserByEmail(email);
  if (!user) {
    return { openaiKey: null, geminiKey: null };
  }
  
  return {
    openaiKey: user.openaiApiKey ? decrypt(user.openaiApiKey) : null,
    geminiKey: user.geminiApiKey ? decrypt(user.geminiApiKey) : null
  };
};

