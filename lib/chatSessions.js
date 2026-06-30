import { supabase } from './supabase'

function mapChat(chat) {
  return {
    id: chat.id,
    user: chat.user_message,
    gpt: chat.gpt_reply,
    gemini: chat.gemini_reply,
    final: chat.final_reply,
    timestamp: chat.created_at,
  }
}

export const getUserSessions = async (userEmail) => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select(`
      id, name, created_at, updated_at,
      chats ( id, user_message, gpt_reply, gemini_reply, final_reply, created_at )
    `)
    .eq('user_email', userEmail)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('Error fetching sessions:', error)
    return []
  }

  return (data || []).map((s) => ({
    id: s.id,
    name: s.name,
    createdAt: s.created_at,
    updatedAt: s.updated_at,
    chats: (s.chats || []).map(mapChat),
  }))
}

export const getSession = async (userEmail, sessionId) => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .select(`
      id, name, created_at, updated_at,
      chats ( id, user_message, gpt_reply, gemini_reply, final_reply, created_at )
    `)
    .eq('user_email', userEmail)
    .eq('id', sessionId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    name: data.name,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    chats: (data.chats || []).map(mapChat),
  }
}

export const createSession = async (userEmail, name = null) => {
  const { count } = await supabase
    .from('chat_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_email', userEmail)

  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_email: userEmail,
      name: name || `Chat ${(count || 0) + 1}`,
    })
    .select('id, name, created_at, updated_at')
    .single()

  if (error) throw new Error(error.message)
  return { id: data.id, name: data.name, createdAt: data.created_at, updatedAt: data.updated_at, chats: [] }
}

export const updateSessionName = async (userEmail, sessionId, newName) => {
  const { data, error } = await supabase
    .from('chat_sessions')
    .update({ name: newName, updated_at: new Date().toISOString() })
    .eq('user_email', userEmail)
    .eq('id', sessionId)
    .select('id, name, created_at, updated_at')
    .single()

  if (error) return null
  return { id: data.id, name: data.name, createdAt: data.created_at, updatedAt: data.updated_at }
}

export const addChatToSession = async (userEmail, sessionId, conversation) => {
  const { data, error } = await supabase
    .from('chats')
    .insert({
      session_id: sessionId,
      user_email: userEmail,
      user_message: conversation.user,
      gpt_reply: conversation.gpt,
      gemini_reply: conversation.gemini,
      final_reply: conversation.final,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)

  await supabase
    .from('chat_sessions')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sessionId)

  return mapChat(data)
}

export const deleteSession = async (userEmail, sessionId) => {
  const { error } = await supabase
    .from('chat_sessions')
    .delete()
    .eq('user_email', userEmail)
    .eq('id', sessionId)

  if (error) throw new Error(error.message)
  return true
}
