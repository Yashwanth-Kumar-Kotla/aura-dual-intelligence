import bcrypt from 'bcryptjs'
import { supabase } from './supabase'
import { encrypt, decrypt } from './encryption'

export const getUserByEmail = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  if (error || !data) return null
  return data
}

export const getUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data
}

export const createUser = async ({ email, password, name }) => {
  const existing = await getUserByEmail(email)
  if (existing) throw new Error('User with this email already exists')

  const hashedPassword = password ? await bcrypt.hash(password, 10) : null

  const { data, error } = await supabase
    .from('users')
    .insert({
      email,
      name: name || email.split('@')[0],
      password_hash: hashedPassword,
    })
    .select('id, email, name, created_at')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export const verifyPassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword)
}

export const updateUserApiKeys = async (email, openaiKey, geminiKey) => {
  const { data, error } = await supabase
    .from('users')
    .update({
      openai_api_key: openaiKey ? encrypt(openaiKey) : null,
      gemini_api_key: geminiKey ? encrypt(geminiKey) : null,
      api_keys_updated_at: new Date().toISOString(),
    })
    .eq('email', email)
    .select('email, name, openai_api_key, gemini_api_key')
    .single()

  if (error) throw new Error(error.message)
  return {
    email: data.email,
    name: data.name,
    hasOpenaiKey: !!data.openai_api_key,
    hasGeminiKey: !!data.gemini_api_key,
  }
}

export const getUserApiKeys = async (email) => {
  const { data, error } = await supabase
    .from('users')
    .select('openai_api_key, gemini_api_key')
    .eq('email', email)
    .single()

  if (error || !data) return { openaiKey: null, geminiKey: null }

  return {
    openaiKey: data.openai_api_key ? decrypt(data.openai_api_key) : null,
    geminiKey: data.gemini_api_key ? decrypt(data.gemini_api_key) : null,
  }
}
