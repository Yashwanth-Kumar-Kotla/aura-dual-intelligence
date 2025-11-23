/**
 * Chat History Storage Utility
 * 
 * Stores chat conversations per user.
 * Currently using JSON files (one file per user).
 * 
 * Structure:
 * - Each user has their own file: data/chats/{userId}.json
 * - Each conversation has: question, gptReply, geminiReply, finalReply, timestamp
 */

import fs from 'fs';
import path from 'path';

const CHATS_DIR = path.join(process.cwd(), 'data', 'chats');

// Ensure chats directory exists
const ensureChatsDir = () => {
  if (!fs.existsSync(CHATS_DIR)) {
    fs.mkdirSync(CHATS_DIR, { recursive: true });
  }
};

// Turn user identifier (email or id) into a safe file name
const sanitizeUserKey = (key) => {
  return String(key).replace(/[^a-zA-Z0-9_-]/g, "_");
};

// Get user's chat history file path
const getUserChatFile = (userKey) => {
  ensureChatsDir();
  const safeKey = sanitizeUserKey(userKey);
  return path.join(CHATS_DIR, `${safeKey}.json`);
};

// Get all conversations for a user
export const getUserChats = (userKey) => {
  try {
    const filePath = getUserChatFile(userKey);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading chat history:', error);
    return [];
  }
};

// Save a new conversation
export const saveChat = (userKey, conversation) => {
  try {
    const chats = getUserChats(userKey);
    const newChat = {
      id: Date.now().toString(),
      user: conversation.user,
      gpt: conversation.gpt,
      gemini: conversation.gemini,
      final: conversation.final,
      timestamp: new Date().toISOString()
    };
    
    chats.push(newChat);
    
    const filePath = getUserChatFile(userKey);
    fs.writeFileSync(filePath, JSON.stringify(chats, null, 2));
    
    return newChat;
  } catch (error) {
    console.error('Error saving chat:', error);
    throw error;
  }
};

// Delete a specific chat
export const deleteChat = (userKey, chatId) => {
  try {
    const chats = getUserChats(userKey);
    const filtered = chats.filter(chat => chat.id !== chatId);
    
    const filePath = getUserChatFile(userKey);
    fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2));
    
    return true;
  } catch (error) {
    console.error('Error deleting chat:', error);
    throw error;
  }
};

// Delete all chats for a user
export const deleteAllChats = (userKey) => {
  try {
    const filePath = getUserChatFile(userKey);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return true;
  } catch (error) {
    console.error('Error deleting all chats:', error);
    throw error;
  }
};

// Get chat statistics for a user
export const getChatStats = (userKey) => {
  const chats = getUserChats(userKey);
  return {
    totalChats: chats.length,
    lastChatDate: chats.length > 0 ? chats[chats.length - 1].timestamp : null
  };
};

