import { supabase } from '../../lib/supabase'

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

export const loginUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error;
  return data;
}

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error;
}

export const changePassword = async (newPassword: string) => {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) throw error
  return data.user
}