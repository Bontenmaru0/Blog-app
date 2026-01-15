import { supabase } from '../../lib/supabase'
import { upsertProfile } from '../profiles/profilesService'

export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw error
  return data
}

export const getUserInfo = async () => {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data
}

export const registerUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error
  if (!data.user) throw new Error('User not created')

  return data.user
}

export const registerWithProfile = async (
  email: string,
  password: string
) => {
  const user = await registerUser(email, password)

  try {
    await upsertProfile(user.id, '', '')
  } catch (err) {
    console.error('Profile upsert failed:', err)
    // 👇 do NOT throw — registration should still complete
  }

  return user
}

export const loginUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}