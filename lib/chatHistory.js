// Legacy stub — chat history is now managed through chatSessions.js + Supabase.
// Kept to avoid breaking any stale imports during transition.

export const getUserChats = async () => []
export const saveChat = async () => null
export const deleteChat = async () => true
export const deleteAllChats = async () => true
export const getChatStats = async () => ({ totalChats: 0, lastChatDate: null })
