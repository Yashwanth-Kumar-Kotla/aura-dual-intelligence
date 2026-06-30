import crypto from 'crypto'
import { supabase } from './supabase'

const OTP_EXPIRY_MINUTES = 10
const RESEND_WAIT_MINUTES = 1
const MAX_ATTEMPTS = 5
const MAX_OTP_REQUESTS_PER_HOUR = 5

export const generateOTP = () => {
  const randomBytes = crypto.randomBytes(3)
  return (parseInt(randomBytes.toString('hex'), 16) % 1000000)
    .toString()
    .padStart(6, '0')
}

export const createOTP = async (email, purpose = 'login') => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('otps')
    .select('*', { count: 'exact', head: true })
    .eq('email', email)
    .gte('created_at', oneHourAgo)

  if ((count || 0) >= MAX_OTP_REQUESTS_PER_HOUR) {
    throw new Error('Too many OTP requests. Please try again later.')
  }

  const oneMinuteAgo = new Date(Date.now() - RESEND_WAIT_MINUTES * 60 * 1000).toISOString()
  const { data: recentOTP } = await supabase
    .from('otps')
    .select('created_at')
    .eq('email', email)
    .gte('created_at', oneMinuteAgo)
    .maybeSingle()

  if (recentOTP) {
    const secondsLeft = Math.ceil(
      (new Date(recentOTP.created_at).getTime() + RESEND_WAIT_MINUTES * 60 * 1000 - Date.now()) / 1000
    )
    throw new Error(`Please wait ${Math.ceil(secondsLeft / 60)} minute(s) before requesting a new code.`)
  }

  await supabase.from('otps').delete().eq('email', email)

  const code = generateOTP()
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString()

  const { error } = await supabase.from('otps').insert({
    email,
    code,
    purpose,
    attempts: 0,
    expires_at: expiresAt,
  })

  if (error) throw new Error(error.message)
  return code
}

export const verifyOTP = async (email, code) => {
  const { data: otp, error } = await supabase
    .from('otps')
    .select('*')
    .eq('email', email)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (error || !otp) {
    return { valid: false, error: 'OTP not found or expired. Please request a new one.' }
  }

  if (otp.attempts >= MAX_ATTEMPTS) {
    await supabase.from('otps').delete().eq('email', email)
    return { valid: false, error: 'Too many failed attempts. Please request a new OTP.' }
  }

  if (otp.code !== code) {
    await supabase.from('otps').update({ attempts: otp.attempts + 1 }).eq('email', email)
    return { valid: false, error: 'Invalid OTP code. Please try again.' }
  }

  await supabase.from('otps').delete().eq('email', email)
  return { valid: true, purpose: otp.purpose }
}

export const getOTPInfo = async (email) => {
  const { data, error } = await supabase
    .from('otps')
    .select('email, expires_at, attempts, purpose')
    .eq('email', email)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (error || !data) return null
  return { email: data.email, expiresAt: data.expires_at, attempts: data.attempts, purpose: data.purpose }
}

export const cleanupExpiredOTPs = async () => {
  await supabase.from('otps').delete().lt('expires_at', new Date().toISOString())
}
