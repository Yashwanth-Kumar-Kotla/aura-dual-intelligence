/**
 * Chat Sessions Storage Utility
 * 
 * Manages chat sessions (like ChatGPT's conversation threads).
 * Each session has a name and contains its own conversation history.
 * 
 * Structure:
 * - Sessions file: data/sessions/{userKey}.json
 * - Each session: { id, name, createdAt, updatedAt, chats: [...] }
 */

import fs from 'fs';
import path from 'path';
import { getUserChats, saveChat as saveChatToHistory } from './chatHistory';

const SESSIONS_DIR = path.join(process.cwd(), 'data', 'sessions');

// Ensure sessions directory exists
const ensureSessionsDir = () => {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
};

// Turn user identifier into a safe file name
const sanitizeUserKey = (key) => {
  return String(key).replace(/[^a-zA-Z0-9_-]/g, "_");
};

// Get user's sessions file path
const getUserSessionsFile = (userKey) => {
  ensureSessionsDir();
  const safeKey = sanitizeUserKey(userKey);
  return path.join(SESSIONS_DIR, `${safeKey}.json`);
};

// Get all sessions for a user
export const getUserSessions = (userKey) => {
  try {
    const filePath = getUserSessionsFile(userKey);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading sessions:', error);
    return [];
  }
};

// Get a specific session
export const getSession = (userKey, sessionId) => {
  const sessions = getUserSessions(userKey);
  return sessions.find(s => s.id === sessionId) || null;
};

// Create a new session
export const createSession = (userKey, name = null) => {
  const sessions = getUserSessions(userKey);
  const newSession = {
    id: Date.now().toString(),
    name: name || `Chat ${sessions.length + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    chats: []
  };
  
  sessions.push(newSession);
  
  const filePath = getUserSessionsFile(userKey);
  fs.writeFileSync(filePath, JSON.stringify(sessions, null, 2));
  
  return newSession;
};

// Update session name
export const updateSessionName = (userKey, sessionId, newName) => {
  const sessions = getUserSessions(userKey);
  const session = sessions.find(s => s.id === sessionId);
  if (session) {
    session.name = newName;
    session.updatedAt = new Date().toISOString();
    
    const filePath = getUserSessionsFile(userKey);
    fs.writeFileSync(filePath, JSON.stringify(sessions, null, 2));
    return session;
  }
  return null;
};

// Add a chat to a session
export const addChatToSession = (userKey, sessionId, conversation) => {
  const sessions = getUserSessions(userKey);
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session) {
    throw new Error('Session not found');
  }
  
  const newChat = {
    id: Date.now().toString(),
    user: conversation.user,
    gpt: conversation.gpt,
    gemini: conversation.gemini,
    final: conversation.final,
    timestamp: new Date().toISOString()
  };
  
  session.chats.push(newChat);
  session.updatedAt = new Date().toISOString();
  
  const filePath = getUserSessionsFile(userKey);
  fs.writeFileSync(filePath, JSON.stringify(sessions, null, 2));
  
  return newChat;
};

// Delete a session
export const deleteSession = (userKey, sessionId) => {
  const sessions = getUserSessions(userKey);
  const filtered = sessions.filter(s => s.id !== sessionId);
  
  const filePath = getUserSessionsFile(userKey);
  fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2));
  
  return true;
};

// Migrate old chats to a default session (for existing users)
export const migrateOldChatsToSession = (userKey) => {
  const oldChats = getUserChats(userKey);
  if (oldChats.length === 0) {
    return null;
  }
  
  // Create a default session
  const defaultSession = createSession(userKey, "Previous Chats");
  
  // Add all old chats to this session
  oldChats.forEach(chat => {
    addChatToSession(userKey, defaultSession.id, {
      user: chat.user,
      gpt: chat.gpt,
      gemini: chat.gemini,
      final: chat.final
    });
  });
  
  return defaultSession;
};

